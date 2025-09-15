// controllers/categoryController.js
import Category from "../models/categoryModel.js";
import { v2 as cloudinary } from "cloudinary";

// ADD CATEGORY WITH IMAGE
export const addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    let imageUrl = "";

    // If an image file is uploaded
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "categories",
      });
      imageUrl = result.secure_url;
    }

    const category = new Category({ name, image: imageUrl });
    await category.save();

    res.json({ success: true, category });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// LIST CATEGORIES
export const listCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ _id: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await Category.findByIdAndDelete(id);
    res.json({ success: true, message: "Category deleted" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
