// controllers/productController.js
import productModel from "../models/productModel.js";
import { uploadToImageKit, deleteFromImageKit } from "../utils/imageUpload.js";

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
      stockStatus,
    } = req.body;

    // Upload images with proper metadata
    const imageUploads = [];
    const imageFields = ["image1", "image2", "image3", "image4", "image5"];

    for (const field of imageFields) {
      if (req.files && req.files[field] && req.files[field][0]) {
        const uploadedImage = await uploadToImageKit(
          req.files[field][0],
          "products",
          { fileName: `${name.replace(/\s+/g, "-")}-${field}` }
        );
        imageUploads.push(uploadedImage);
      }
    }

    if (imageUploads.length === 0) {
      return res.json({
        success: false,
        message: "At least one image is required",
      });
    }

    const productData = {
      name,
      description,
      category,
      price: Number(price),
      discount: Number(discount),
      bestseller: bestseller === "true",
      sizes: JSON.parse(sizes || "[]"),
      stockStatus: stockStatus || "In stock",
      images: imageUploads, // Store images with metadata
    };

    const product = new productModel(productData);
    await product.save();

    res.json({
      success: true,
      message: "Product Added",
      productId: product._id,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ==================== UPDATE PRODUCT ====================
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
      stockStatus,
    } = req.body;

    const existingProduct = await productModel.findById(id);
    if (!existingProduct) {
      return res.json({ success: false, message: "Product not found" });
    }

    let updatedImages = [...existingProduct.images];

    // Update specific images if provided
    const imageUpdates = [
      { field: "image1", position: 0 },
      { field: "image2", position: 1 },
      { field: "image3", position: 2 },
      { field: "image4", position: 3 },
      { field: "image5", position: 4 },
    ];

    for (const { field, position } of imageUpdates) {
      if (req.files && req.files[field] && req.files[field][0]) {
        // Delete old image from ImageKit if exists
        if (updatedImages[position] && updatedImages[position].fileId) {
          await deleteFromImageKit(updatedImages[position].fileId);
        }

        // Upload new image
        const newImage = await uploadToImageKit(
          req.files[field][0],
          "products",
          { fileName: `${name || existingProduct.name}-${field}` }
        );

        updatedImages[position] = newImage;
      }
    }

    // Remove empty slots
    updatedImages = updatedImages.filter(
      (img) => img !== null && img !== undefined
    );

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
      ...(typeof stockStatus !== "undefined" && { stockStatus }),
      images: updatedImages,
    };

    const updatedProduct = await productModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

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

// ==================== REMOVE PRODUCT ====================
const removeProduct = async (req, res) => {
  try {
    const product = await productModel.findById(req.body.id);

    if (product) {
      // Delete all images from ImageKit
      if (product.images && product.images.length > 0) {
        for (const image of product.images) {
          if (image.fileId) {
            await deleteFromImageKit(image.fileId);
          }
        }
      }

      await productModel.findByIdAndDelete(req.body.id);
      res.json({ success: true, message: "Product Removed" });
    } else {
      res.json({ success: false, message: "Product not found" });
    }
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

// ⭐ Update favorite status
export const updateFavorite = async (req, res) => {
  try {
    const { id } = req.params; // product id
    const { isFavorite } = req.body; // true or false

    const product = await productModel.findByIdAndUpdate(
      id,
      { isFavorite },
      { new: true }
    );

    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, product });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ⭐ Get all favorite products
export const getFavorites = async (req, res) => {
  try {
    const favorites = await productModel.find({ isFavorite: true });
    res.json({ success: true, products: favorites });
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
