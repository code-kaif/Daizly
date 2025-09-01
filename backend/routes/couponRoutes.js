import express from "express";
import {
  createCoupon,
  getCoupons,
  validateCoupon,
  deleteCoupon,
} from "../controllers/couponController.js";

const couponRouter = express.Router();

// Admin side
couponRouter.post("/", createCoupon); // create coupon
couponRouter.get("/", getCoupons); // get all coupons
couponRouter.delete("/:id", deleteCoupon); // delete coupon

// User side
couponRouter.get("/validate/:code", validateCoupon); // validate coupon by code

export default couponRouter;
