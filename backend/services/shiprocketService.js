// services/shiprocketService.js
import axios from "axios";
import orderModel from "../models/orderModel.js";

const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL;
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD;

let shiprocketToken = null;

// --- helpers ---
export async function ensureLogin() {
  if (shiprocketToken) return shiprocketToken;
  const { data } = await axios.post(
    "https://apiv2.shiprocket.in/v1/external/auth/login",
    { email: SHIPROCKET_EMAIL, password: SHIPROCKET_PASSWORD }
  );
  shiprocketToken = data.token;
  return shiprocketToken;
}

async function getPickupLocationName() {
  await ensureLogin();
  const { data } = await axios.get(
    "https://apiv2.shiprocket.in/v1/external/settings/company/pickup",
    { headers: { Authorization: `Bearer ${shiprocketToken}` } }
  );

  // Shiprocket returns: { data: { shipping_address: [ { pickup_location: '...', ... } ] } }
  const list = data?.data?.shipping_address || [];
  if (!list.length) {
    throw new Error(
      "No pickup locations configured in Shiprocket. Please add one in Settings → Pickup Address."
    );
  }
  // choose the first one (or customize selection by nickname if you want)
  return list[0].pickup_location;
}

function formatOrderDateIST(date = new Date()) {
  // Shiprocket expects "YYYY-MM-DD HH:mm:ss"
  const pad = (n) => String(n).padStart(2, "0");
  const ist = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
  const yyyy = ist.getFullYear();
  const mm = pad(ist.getMonth() + 1);
  const dd = pad(ist.getDate());
  const hh = pad(ist.getHours());
  const mi = pad(ist.getMinutes());
  const ss = pad(ist.getSeconds());
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

// --- main export ---
export async function createShiprocketOrder(order) {
  try {
    await ensureLogin();

    // pull address from order
    const addr =
      order?.address || order?.shippingAddress || order?.billingAddress || null;

    if (!addr) {
      throw new Error(
        "Order has no address. Make sure you pass address when creating the order."
      );
    }

    const required = {
      firstName: addr.firstName,
      lastName: addr.lastName,
      addressLine: [addr.houseNo, addr.street, addr.area]
        .filter(Boolean)
        .join(", "),
      city: addr.city,
      state: addr.state,
      pincode: addr.zipcode,
      country: addr.country || "India",
      email: addr.email,
      phone: addr.phone,
    };

    // validate required fields for Shiprocket
    const missing = Object.entries(required)
      .filter(([, v]) => !v || String(v).trim() === "")
      .map(([k]) => k);
    if (missing.length) {
      throw new Error(
        `Incomplete address for Shiprocket: missing ${missing.join(", ")}`
      );
    }

    const pickup_location = await getPickupLocationName();

    // map items
    const order_items = (order.items || []).map((it) => ({
      name: it?.name || "Item",
      sku: it?._id || it?.sku || it?.productId || "SKU-" + (it?.name || "NA"),
      units: Number(it?.quantity || 1),
      // prefer discounted price if present, else price
      selling_price: Number(it?.discount ?? it?.price ?? 0),
    }));

    if (!order_items.length) {
      throw new Error("Order has no items to send to Shiprocket.");
    }

    // Shiprocket payload
    const payload = {
      order_id: String(order._id),
      order_date: formatOrderDateIST(
        order.date ? new Date(order.date) : new Date()
      ),
      pickup_location, // <-- valid nickname from API
      billing_customer_name: required.firstName,
      billing_last_name: required.lastName,
      billing_address: required.addressLine,
      billing_city: required.city,
      billing_pincode: String(required.pincode),
      billing_state: required.state,
      billing_country: required.country,
      billing_email: required.email,
      billing_phone: String(required.phone),
      shipping_is_billing: 1, // Shiprocket prefers 1/0
      order_items,
      payment_method: order.paymentMethod === "Razorpay" ? "Prepaid" : "COD",
      sub_total: Number(order.amount || 0), // can be sum of items; your final amount is ok
      length: Number(order.length || 10),
      breadth: Number(order.breadth || 10),
      height: Number(order.height || 10),
      weight: Number(order.weight || 1),
    };

    const { data } = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
      payload,
      { headers: { Authorization: `Bearer ${shiprocketToken}` } }
    );

    if (data?.order_id) {
      // save shiprocket ids in your DB order
      await orderModel.findByIdAndUpdate(order._id, {
        shiprocketOrderId: data.order_id,
        shiprocketShipmentId: data.shipment_id,
      });
    }

    // Some errors are returned with 200 shape; normalize
    if (data?.message && /wrong pickup location/i.test(data.message)) {
      // fetch list for debug
      const name = await getPickupLocationName();
      throw new Error(
        `Wrong pickup_location. Try: "${name}" (fetched from Shiprocket).`
      );
    }

    console.log("Shiprocket Order Created:", data);
    return data;
  } catch (err) {
    const apiErr = err?.response?.data || err?.message || err;
    console.error("Shiprocket Order Error:", apiErr);
    throw err;
  }
}

export async function cancelShiprocketOrder(shiprocketOrderId) {
  try {
    await ensureLogin();
    const { data } = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/orders/cancel",
      { ids: [shiprocketOrderId] },
      { headers: { Authorization: `Bearer ${shiprocketToken}` } }
    );
    console.log("✅ Shiprocket Order Cancelled:", data);
    return data;
  } catch (err) {
    console.error(
      "❌ Shiprocket Cancel Error:",
      err.response?.data || err.message
    );
    throw err;
  }
}

// shiprocket tracking api - UPDATED
export async function getShiprocketTracking(shipmentId) {
  await ensureLogin();
  try {
    const { data } = await axios.get(
      `https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${shipmentId}`,
      {
        headers: { Authorization: `Bearer ${shiprocketToken}` },
        timeout: 10000, // 10 second timeout
      }
    );

    console.log("Shiprocket API Full Response:", JSON.stringify(data, null, 2));

    // Extract the specific shipment data
    const shipmentData = data[shipmentId] || data;
    const track = shipmentData?.tracking_data;

    if (!track) {
      return [
        {
          current_status: "No Tracking Data",
          status_date: new Date().toLocaleString(),
          message: "Shipment not found in tracking system",
        },
      ];
    }

    // DEBUG: Log the actual structure
    console.log("Track status:", track.track_status);
    console.log("Shipment status:", track.shipment_status);
    console.log("Error:", track.error);
    console.log("Shipment track array:", track.shipment_track);

    // Check if there's a meaningful shipment status even if track_status is 0
    if (
      track.shipment_status &&
      track.shipment_status !== 0 &&
      track.shipment_status !== "0"
    ) {
      // Map Shiprocket statuses to your display statuses
      const statusMap = {
        NEW: "New Order",
        PROCESSING: "Processing",
        MANIFEST_GENERATED: "Manifest Generated",
        DISPATCHED: "Dispatched",
        IN_TRANSIT: "In Transit",
        OUT_FOR_DELIVERY: "Out for Delivery",
        DELIVERED: "Delivered",
        CANCELLED: "Cancelled",
        RTO: "Returned to Origin",
        LOST: "Lost",
        DAMAGED: "Damaged",
      };

      const displayStatus =
        statusMap[track.shipment_status] || track.shipment_status;

      return [
        {
          current_status: displayStatus,
          status_date: track.updated_at || new Date().toLocaleString(),
          location: track.consignee_detail?.city || "",
          message: "Latest status from Shiprocket",
        },
      ];
    }

    // Check for "no activities found" error but shipment exists
    if (track.error && track.error.includes("no activities found")) {
      return [
        {
          current_status: "Order Placed",
          status_date: new Date().toLocaleString(),
          message: "Awaiting first tracking scan from courier",
        },
      ];
    }

    // Check if track_status is 0 but shipment exists
    if (track.track_status === 0 || track.track_status === "0") {
      return [
        {
          current_status: "Order Confirmed",
          status_date: new Date().toLocaleString(),
          message: "Shipment created, awaiting pickup",
        },
      ];
    }

    // Return all tracking events if available
    if (
      track?.shipment_track &&
      Array.isArray(track.shipment_track) &&
      track.shipment_track.length > 0
    ) {
      const validEvents = track.shipment_track.filter(
        (event) => event.current_status && event.current_status.trim() !== ""
      );

      if (validEvents.length > 0) {
        return validEvents.map((event) => ({
          current_status: event.current_status,
          status_date:
            event.status_date ||
            event.updated_time_stamp ||
            new Date().toLocaleString(),
          location: event.current_location || event.destination || "",
          consignee: event.consignee_name || event.delivered_to || "",
        }));
      }
    }

    // Fallback to basic status if available
    if (track.shipment_status) {
      return [
        {
          current_status: track.shipment_status,
          status_date: track.updated_at || new Date().toLocaleString(),
        },
      ];
    }

    // Default response
    return [
      {
        current_status: "Processing",
        status_date: new Date().toLocaleString(),
        message: "Tracking information is being updated",
      },
    ];
  } catch (error) {
    console.error(
      "Shiprocket tracking error:",
      error.response?.data || error.message
    );

    // More specific error handling
    if (error.response?.status === 401) {
      // Token expired, reset and retry
      shiprocketToken = null;
      await ensureLogin();
      return getShiprocketTracking(shipmentId); // Retry
    }

    if (error.response?.status === 404) {
      return [
        {
          current_status: "Not Found",
          status_date: new Date().toLocaleString(),
          message: "Shipment ID not found in Shiprocket",
        },
      ];
    }

    return [
      {
        current_status: "Tracking Error",
        status_date: new Date().toLocaleString(),
        message: "Unable to fetch tracking information",
      },
    ];
  }
}
