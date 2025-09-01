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

export async function getShiprocketTracking(shipmentId) {
  await ensureLogin();
  const { data } = await axios.get(
    `https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${shipmentId}`,
    { headers: { Authorization: `Bearer ${shiprocketToken}` } }
  );
  return data;
}
