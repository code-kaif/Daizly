import Coupon from "../models/couponModel.js";

// Create new coupon
export const createCoupon = async (req, res) => {
  try {
    const { code, discountPercent } = req.body;

    const existing = await Coupon.findOne({ code });
    if (existing) {
      return res.json({ success: false, message: "Coupon already exists" });
    }

    const coupon = new Coupon({ code, discountPercent });
    await coupon.save();

    res.json({ success: true, message: "Coupon created", coupon });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Get all coupons
export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Validate coupon by code
export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.params;
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.json({ success: false, message: "Invalid coupon" });
    }

    res.json({ success: true, coupon });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Delete coupon
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Coupon.findByIdAndDelete(id);

    if (!deleted) {
      return res.json({ success: false, message: "Coupon not found" });
    }

    res.json({ success: true, message: "Coupon deleted" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
