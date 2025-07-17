import express from "express";
import {
  placeOrder,
  placeOrderStripe,
  allOrders,
  userOrders,
  updateStatus,
  verifyStripe,
  cancelOrder,
  cancelledOrder,
  exportOrdersCsv,
  exportMonthlyOrders,
} from "../controllers/orderController.js";
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js";

const orderRouter = express.Router();

// Admin Features
orderRouter.post("/list", adminAuth, allOrders);
orderRouter.post("/status", adminAuth, updateStatus);
orderRouter.get("/export", adminAuth, exportOrdersCsv);
orderRouter.get("/export-monthly", adminAuth, exportMonthlyOrders);

orderRouter.get("/cancelled", adminAuth, cancelledOrder);

// Payment Features
orderRouter.post("/place", authUser, placeOrder);
orderRouter.post("/stripe", authUser, placeOrderStripe);

// User Feature
orderRouter.post("/userorders", authUser, userOrders);
orderRouter.post("/cancel", authUser, cancelOrder);

// verify payment
orderRouter.post("/verifyStripe", authUser, verifyStripe);

export default orderRouter;
