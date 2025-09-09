import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    items: { type: Array, required: true },
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: {
      type: String,
      required: true,
      default: "Order Placed",
      enum: [
        "Order Placed",
        "Processing",
        "Dispatched",
        "In Transit",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
        "RTO",
        "Lost",
        "Damaged",
      ],
    },
    paymentMethod: { type: String, required: true },
    payment: { type: Boolean, required: true, default: false },
    date: { type: Number, required: true },
    orderCancelled: { type: Boolean, required: true, default: false },
    orderCompleted: { type: Boolean, default: false }, // ✅ NEW FIELD
    shiprocketOrderId: { type: Number },
    shiprocketShipmentId: { type: Number },
    // ✅ Optional: Add tracking history for better audit
    trackingHistory: [
      {
        status: String,
        statusDate: { type: Date, default: Date.now },
        message: String,
        location: String,
      },
    ],
    // ✅ Optional: Add last tracking update timestamp
    lastTrackingUpdate: { type: Date },
  },
  {
    timestamps: true, // ✅ Adds createdAt and updatedAt automatically
  }
);

const orderModel =
  mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;
