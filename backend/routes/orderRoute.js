import express from "express";
import {
  placeOrder,
  placeOrderRazorpay,
  allOrders,
  userOrders,
  updateStatus,
  verifyRazorpay,
  cancelOrder,
  cancelledOrder,
  exportOrdersCsv,
  TrackOrder,
  TrackAllOrdersAdmin,
  // exportMonthlyOrders,
} from "../controllers/orderController.js";
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js";

const orderRouter = express.Router();

// Admin Features
orderRouter.post("/list", adminAuth, allOrders);
orderRouter.post("/status", adminAuth, updateStatus);
orderRouter.post("/track", authUser, TrackOrder);
orderRouter.get("/track-all", adminAuth, TrackAllOrdersAdmin);
orderRouter.get("/export", adminAuth, exportOrdersCsv);
// orderRouter.get("/export-monthly", adminAuth, exportMonthlyOrders);

orderRouter.get("/cancelled", adminAuth, cancelledOrder);

// Payment Features
orderRouter.post("/place", authUser, placeOrder);
orderRouter.post("/razorpay", authUser, placeOrderRazorpay);

// User Feature
orderRouter.post("/userorders", authUser, userOrders);
orderRouter.post("/cancel", authUser, cancelOrder);

// verify payment
orderRouter.post("/verifyRazorpay", authUser, verifyRazorpay);

export default orderRouter;
