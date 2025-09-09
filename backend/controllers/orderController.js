import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import nodemailer from "nodemailer";
import { Parser } from "json2csv";
import razorpay from "razorpay";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import {
  cancelShiprocketOrder,
  createShiprocketOrder,
  getShiprocketTracking,
} from "../services/shiprocketService.js";
import { sendMetaEvent } from "../services/metaService.js";

// global variables
const currency = "inr";
const deliveryCharge = 0;

// gateway initialize
const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Setup transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email sending function
const sendAdminOrderEmail = async (order) => {
  const mailOptions = {
    from: `"DAIZLY" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: "🛒 New Order Received - Daizly",
    html: `
  <h2>🛒 New Order Placed on Daizly</h2>
  <p><strong>Name:</strong> ${order.address.firstName} ${
      order.address.lastName
    }</p>
  <p><strong>Phone:</strong> ${order.address.phone}</p>
  <p><strong>Payment:</strong> ${order.paymentMethod} (${
      order.payment ? "Paid" : "Unpaid"
    })</p>
  <p><strong>Total Amount:</strong> ₹${order.amount}</p>
  <p><strong>Status:</strong> ${order.status || "Order Placed"}</p>

  <h4>Items:</h4>
  <ul>
    ${order.items
      .map(
        (item) =>
          `<li>${item.name} - ₹${item.discount} × ${item.quantity} (${item.size})</li>`
      )
      .join("")}
  </ul>

  <div style="margin-top: 24px;">
    <a href="https://admin.daizly.in/orders" target="_blank" style="
      display: inline-block;
      background-color: #111827;
      color: #ffffff;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: bold;
      font-size: 14px;
    ">🔍 View Order in Admin Panel</a>
  </div>
`,
  };

  await transporter.sendMail(mailOptions);
};

// ⬇️ Main Order Handler
const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
    };
    const newOrder = new orderModel(orderData);
    await newOrder.save();

    await createShiprocketOrder(newOrder);
    await userModel.findByIdAndUpdate(userId, { cartData: {} });
    await sendAdminOrderEmail(newOrder);

    // 🔹 Send Purchase Event to Meta
    await sendMetaEvent(
      "Purchase",
      {
        email: address.email,
        phone: address.phone,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      },
      {
        currency: "INR",
        value: amount,
        contents: items.map((i) => ({ id: i._id, quantity: i.quantity })),
      },
      `order_${newOrder._id}`
    );

    res.json({ success: true, message: "Order Placed" });
  } catch (error) {
    console.log("Order error:", error);
    res.json({ success: false, message: error.message });
  }
};

// Placing orders using Razorpay Method
const placeOrderRazorpay = async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100, // convert to paise
      currency: currency.toUpperCase(),
      receipt: "rcpt_" + Date.now(),
    };

    razorpayInstance.orders.create(options, (error, order) => {
      if (error) {
        console.log(error);
        return res.json({ success: false, message: error });
      }
      res.json({ success: true, order });
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const verifyRazorpay = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      address,
      amount,
      coupon,
    } = req.body;

    // ✅ extract userId from token
    const token = req.headers.token;
    if (!token) return res.json({ success: false, message: "Not Authorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // fetch Razorpay order
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    if (orderInfo.status === "paid") {
      const orderData = {
        userId,
        items,
        address,
        amount,
        paymentMethod: "Razorpay",
        payment: true,
        date: Date.now(),
      };
      const newOrder = new orderModel(orderData);
      await newOrder.save();

      await createShiprocketOrder(newOrder);
      await userModel.findByIdAndUpdate(userId, { cartData: {} });

      // 🔹 Send Purchase Event
      await sendMetaEvent(
        "Purchase",
        {
          email: address.email,
          phone: address.phone,
          ip: req.ip,
          userAgent: req.headers["user-agent"],
        },
        {
          currency: "INR",
          value: amount,
          contents: items.map((i) => ({ id: i._id, quantity: i.quantity })),
        },
        `order_${newOrder._id}`
      );

      res.json({ success: true, message: "Payment Successful" });
    } else {
      res.json({ success: false, message: "Payment Failed" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// All Orders data for Admin Panel
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ orderCancelled: { $ne: true } }) // show only non-cancelled
      .sort({ date: 1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// User Order Data For Forntend
const userOrders = async (req, res) => {
  try {
    const { userId } = req.body;

    const orders = await orderModel.find({ userId });
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// update order status from Admin Panel
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    await orderModel.findByIdAndUpdate(orderId, { status });
    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Add this function to update order status based on tracking
export async function updateOrderStatusFromTracking(orderId, trackingStatus) {
  try {
    console.log(
      `Received trackingStatus: ${trackingStatus}, type: ${typeof trackingStatus}`
    );

    // Convert to string for consistent lookup
    const statusKey = String(trackingStatus || "");

    const statusMap = {
      "New Order": "Order Placed",
      "Order Confirmed": "Order Placed",
      "Processing": "Processing",
      "Manifest Generated": "Processing",
      "Dispatched": "Dispatched",
      "In Transit": "In Transit",
      "Out for Delivery": "Out for Delivery",
      "Delivered": "Delivered",
      "Cancelled": "Cancelled",
      "Returned to Origin": "RTO",
      "Lost": "Lost",
      "Damaged": "Damaged",
      "0": "Order Placed",
      "1": "Processing",
    };

    const newStatus = statusMap[statusKey] || statusKey;

    await orderModel.findByIdAndUpdate(orderId, {
      status: newStatus,
      ...(newStatus === "Delivered" && { orderCompleted: true }),
    });

    console.log(`Updated order ${orderId} to: ${newStatus}`);
  } catch (error) {
    console.error(`Error updating order status: ${error.message}`);
  }
}

// Modify BulkTrackOrders to update statuses
const BulkTrackOrders = async (req, res) => {
  try {
    const { orderIds } = req.body;
    console.log("Tracking order IDs:", orderIds);

    if (!orderIds || !Array.isArray(orderIds)) {
      return res.json({ success: false, message: "orderIds required" });
    }

    const objectIds = orderIds.map((id) => new mongoose.Types.ObjectId(id));

    const orders = await orderModel.find({
      _id: { $in: objectIds },
      shiprocketShipmentId: { $exists: true, $ne: null },
      orderCancelled: { $ne: true },
      status: { $ne: "Cancelled" },
    });

    let trackingResults = {};
    for (const order of orders) {
      try {
        if (order.orderCancelled || order.status === "Cancelled") {
          trackingResults[order._id] = [];
          continue;
        }

        console.log(
          `Fetching tracking for shipment: ${order.shiprocketShipmentId}`
        );
        const tracking = await getShiprocketTracking(
          order.shiprocketShipmentId
        );

        // Update order status based on tracking
        if (tracking && tracking.length > 0) {
          await updateOrderStatusFromTracking(
            order._id,
            tracking[0].current_status
          );
        }

        trackingResults[order._id] = tracking;
      } catch (err) {
        console.error(`Tracking error for ${order.shiprocketShipmentId}:`, err);
        trackingResults[order._id] = [];
      }
    }

    orderIds.forEach((id) => {
      if (!trackingResults[id]) {
        trackingResults[id] = [];
      }
    });

    res.json({ success: true, tracking: trackingResults });
  } catch (error) {
    console.error("Bulk tracking error:", error);
    res.json({ success: false, message: error.message });
  }
};

const exportOrdersCsv = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: "Date required" });
    }

    // Parse date in IST
    const istOffset = 5.5 * 60 * 60 * 1000;
    const selectedDate = new Date(new Date(date).getTime() + istOffset);

    const start = new Date(selectedDate.setHours(0, 0, 0, 0)).getTime();
    const end = new Date(selectedDate.setHours(23, 59, 59, 999)).getTime();

    // 🛑 Exclude cancelled orders
    const orders = await orderModel.find({
      date: { $gte: start, $lte: end },
      orderCancelled: { $ne: true },
    });

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found for this date",
      });
    }

    // Each item as a row with full order info
    const flatItems = [];
    orders.forEach((order) => {
      order.items.forEach((item) => {
        flatItems.push({
          OrderID: order._id,
          Name: `${order.address.firstName} ${order.address.lastName}`,
          Mobile: order.address.phone,
          Address: `${order.address.houseNo}, ${order.address.street}, ${order.address.area}, ${order.address.city}, ${order.address.state} - ${order.address.zipcode}`,
          Payment: order.paymentMethod,
          Amount: order.amount,
          Status: order.status,
          Date: new Date(order.date + istOffset).toLocaleDateString("en-IN"),
          ItemName: item.name,
          Quantity: item.quantity,
          Size: item.size,
        });
      });
    });

    const parser = new Parser();
    const csv = parser.parse(flatItems);

    res.header("Content-Type", "text/csv");
    res.attachment(`orders-${date}.csv`);
    res.send(csv);
  } catch (err) {
    console.error("CSV Export Error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to export orders" });
  }
};

// Cancel order for user
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await orderModel.findById(orderId);

    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    if (order.status === "Cancelled" && order.orderCancelled)
      return res.json({
        success: false,
        message: "Order already cancelled by user",
      });

    if (order.status === "Delivered")
      return res.json({
        success: false,
        message: "Delivered order cannot be cancelled",
      });

    if (order.shiprocketOrderId) {
      try {
        await cancelShiprocketOrder(order.shiprocketOrderId);
      } catch (err) {
        console.error("Shiprocket cancel failed:", err.message);
      }
    }

    // Mark order as cancelled
    order.status = "Cancelled";
    order.orderCancelled = true;
    await order.save();

    // After marking order as cancelled
    await sendMetaEvent(
      "CancelOrder",
      {
        email: order.address.email,
        phone: order.address.phone,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      },
      { currency: "INR", value: order.amount },
      `order_${order._id}_cancel`
    );

    // Fetch user info
    const user = await userModel.findById(order.userId);

    // Email content
    const mailOptions = {
      from: `"DAIZLY" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to admin
      subject: `Order Cancelled - ${order._id}`,
      html: `
        <h3>🚫 Order Cancelled by User</h3>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Status:</strong> ${order.status}</p>
        <p><strong>Date:</strong> ${new Date(order.date).toLocaleString(
          "en-IN"
        )}</p>
        <hr />
        <p><strong>Customer:</strong> ${order.address?.firstName || ""} ${
        order.address?.lastName || ""
      }</p>
        <p><strong>Phone:</strong> ${order.address?.phone}</p>
        <p><strong>Address:</strong> ${order.address?.houseNo}, ${
        order.address?.street
      }, ${order.address?.area}, ${order.address?.city}, ${
        order.address?.state
      } - ${order.address?.zipcode}</p>
        <hr />
        <h4>🧾 Items:</h4>
        <ul>
          ${order.items
            .map(
              (item) =>
                `<li>${item.name} x ${item.quantity} (${item.size})</li>`
            )
            .join("")}
        </ul>
        <p><strong>Total:</strong> ₹${order.amount}</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "Order cancelled successfully" });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all user-cancelled orders (admin)
const cancelledOrder = async (req, res) => {
  try {
    const cancelledOrders = await orderModel
      .find({ status: "Cancelled", orderCancelled: true }) // ✅ filter by both
      .sort({ date: -1 });

    res.json({ success: true, orders: cancelledOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  verifyRazorpay,
  placeOrderRazorpay,
  placeOrder,
  allOrders,
  userOrders,
  updateStatus,
  exportOrdersCsv,
  cancelOrder,
  cancelledOrder,
  BulkTrackOrders,
};
