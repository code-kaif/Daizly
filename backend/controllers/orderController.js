import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import nodemailer from "nodemailer";
import { Parser } from "json2csv";
import Stripe from "stripe";

// global variables
const currency = "inr";
const deliveryCharge = 0;

// gateway initialize
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
    from: `"FV7 Store" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: "🛒 New Order Received - FV7",
    html: `
  <h2>🛒 New Order Placed on FV7</h2>
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
          `<li>${item.name} - ₹${item.price} × ${item.quantity} (${item.size})</li>`
      )
      .join("")}
  </ul>

  <div style="margin-top: 24px;">
    <a href="http://localhost:5174/orders" target="_blank" style="
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

    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    await sendAdminOrderEmail(newOrder); // ✅ Send email to admin

    res.json({ success: true, message: "Order Placed" });
  } catch (error) {
    console.log("Order error:", error);
    res.json({ success: false, message: error.message });
  }
};

// Placing orders using Stripe Method
const placeOrderStripe = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;
    const { origin } = req.headers;

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "Stripe",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    const line_items = items.map((item) => ({
      price_data: {
        currency: currency,
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));

    line_items.push({
      price_data: {
        currency: currency,
        product_data: {
          name: "Delivery Charges",
        },
        unit_amount: deliveryCharge * 100,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
      line_items,
      mode: "payment",
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Verify Stripe
const verifyStripe = async (req, res) => {
  const { orderId, success, userId } = req.body;

  try {
    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
      res.json({ success: true });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false });
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
      .sort({ date: -1 });
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
          Address: `${order.address.street}, ${order.address.city}, ${order.address.state} - ${order.address.zipcode}`,
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

    // Only allow cancel if not delivered
    if (order.status === "Delivered")
      return res.json({
        success: false,
        message: "Delivered order cannot be cancelled",
      });

    order.status = "Cancelled";
    order.orderCancelled = true; // 👈 user initiated
    await order.save();

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
  verifyStripe,
  placeOrder,
  placeOrderStripe,
  allOrders,
  userOrders,
  updateStatus,
  exportOrdersCsv,
  cancelOrder,
  cancelledOrder,
};
