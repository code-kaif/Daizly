import mongoose from "mongoose";

// Review Schema (unchanged)
const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Image Schema for ImageKit metadata
const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  fileId: { type: String, required: true },
  fileName: String,
  thumbnailUrl: String,
  fileType: { type: String },
  mimeType: { type: String },
  uploadedAt: { type: Date, default: Date.now },
});

// Product Schema (updated)
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, required: true },
    // Changed from Array of strings to Array of image objects
    images: [imageSchema],
    category: { type: String, required: true },
    sizes: { type: Array },
    stockStatus: {
      type: String,
      enum: ["In stock", "Out of stock", "Coming soon"],
      default: "In stock",
    },
    bestseller: { type: Boolean, default: false },
    date: { type: Date, default: Date.now }, // Changed from Number to Date
    reviews: [reviewSchema],
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    isFavorite: { type: Boolean, default: false },
    // Additional metadata
    totalSales: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Middleware to calculate average rating before saving
productSchema.pre("save", function (next) {
  if (this.reviews && this.reviews.length > 0) {
    const total = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = total / this.reviews.length;
  } else {
    this.averageRating = 0;
  }
  next();
});

const productModel =
  mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;
