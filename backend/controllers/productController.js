import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";

// ==================== ADD PRODUCT ====================
const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discount,
      category,
      sizes,
      bestseller,
      stockStatus, // ✅ new field
    } = req.body;

    const image1 = req.files.image1 && req.files.image1[0];
    const image2 = req.files.image2 && req.files.image2[0];
    const image3 = req.files.image3 && req.files.image3[0];
    const image4 = req.files.image4 && req.files.image4[0];

    const images = [image1, image2, image3, image4].filter(
      (item) => item !== undefined
    );

    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, {
          resource_type: "auto", // ✅ auto detects image OR video
        });
        return result.secure_url;
      })
    );

    const productData = {
      name,
      description,
      category,
      price: Number(price),
      discount: Number(discount),
      bestseller: bestseller === "true" ? true : false,
      sizes: JSON.parse(sizes),
      stockStatus: stockStatus || "In stock", // ✅ save with default if missing
      image: imagesUrl,
      date: Date.now(),
    };

    const product = new productModel(productData);
    await product.save();

    res.json({ success: true, message: "Product Added" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      discount,
      category,
      sizes,
      bestseller,
      stockStatus, // ✅ new field
    } = req.body;

    // Handle new images if uploaded
    const image1 = req.files?.image1 && req.files.image1[0];
    const image2 = req.files?.image2 && req.files.image2[0];
    const image3 = req.files?.image3 && req.files.image3[0];
    const image4 = req.files?.image4 && req.files.image4[0];

    const images = [image1, image2, image3, image4].filter(Boolean);

    let imagesUrl = [];
    if (images.length > 0) {
      imagesUrl = await Promise.all(
        images.map(async (item) => {
          let result = await cloudinary.uploader.upload(item.path, {
            resource_type: "auto",
          });
          return result.secure_url;
        })
      );
    }

    // Prepare update object
    const updateData = {
      ...(name && { name }),
      ...(description && { description }),
      ...(price && { price: Number(price) }),
      ...(discount && { discount: Number(discount) }),
      ...(category && { category }),
      ...(sizes && { sizes: JSON.parse(sizes) }),
      ...(typeof bestseller !== "undefined" && {
        bestseller: bestseller === "true",
      }),
      ...(typeof stockStatus !== "undefined" && { stockStatus }), // ✅ include if provided
      ...(imagesUrl.length > 0 && { image: imagesUrl }),
    };

    const updatedProduct = await productModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedProduct) {
      return res.json({ success: false, message: "Product not found" });
    }

    res.json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ==================== LIST PRODUCTS ====================
const listProducts = async (req, res) => {
  try {
    const products = await productModel.find({}).sort({ date: -1 });
    res.json({ success: true, products });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ==================== REMOVE PRODUCT ====================
const removeProduct = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Product Removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ==================== SINGLE PRODUCT ====================
const singleProduct = async (req, res) => {
  try {
    const { id } = req.body;
    const product = await productModel.findById(id);
    res.json({ success: true, product });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ⭐ Add a review
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;
    const userId = req.body.userId; // set from auth middleware

    if (!rating || !comment) {
      return res.json({
        success: false,
        message: "Rating and comment required",
      });
    }

    const product = await productModel.findById(productId);
    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    // check if user already reviewed
    const alreadyReviewed = product.reviews.find(
      (rev) => rev.user.toString() === userId
    );

    if (alreadyReviewed) {
      return res.json({
        success: false,
        message: "You already reviewed this product",
      });
    }

    const review = {
      user: userId,
      rating: Number(rating),
      comment,
      date: Date.now(),
    };

    product.reviews.push(review);
    await product.save();

    res.json({ success: true, message: "Review added successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ⭐ Get all reviews for a product
const getReviews = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await productModel
      .findById(productId)
      .populate("reviews.user", "name"); // only get user's name

    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, reviews: product.reviews });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  listProducts,
  addProduct,
  removeProduct,
  singleProduct,
  addReview,
  getReviews,
};
