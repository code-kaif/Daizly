// routes/categoryRoutes.js
import express from "express";
import multer from "multer";
import {
  addCategory,
  deleteCategory,
  listCategories,
} from "../controllers/categoryController.js";
import adminAuth from "../middleware/adminAuth.js";

const categoryRouter = express.Router();

// multer setup (temporary storage before uploading to cloudinary)
const storage = multer.diskStorage({});
const upload = multer({ storage });

categoryRouter.post("/add", adminAuth, upload.single("image"), addCategory);
categoryRouter.get("/list", listCategories);
categoryRouter.delete("/delete/:id", adminAuth, deleteCategory);

export default categoryRouter;
