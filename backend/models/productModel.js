import mongoose from "mongoose";

// Review Schema
const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true }, // linked with User model
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, required: true },
  image: { type: Array, required: true },
  category: { type: String, required: true },
  sizes: { type: Array },
  stockStatus: {
    type: String,
    enum: ["In stock", "Out of stock", "Coming soon"],
    default: "In stock",
  },
  bestseller: { type: Boolean },
  date: { type: Number, required: true },
  // New fields for reviews
  reviews: [reviewSchema],
  averageRating: { type: Number, default: 0 },
  isFavorite: { type: Boolean, default: false },
});

const productModel =
  mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;
