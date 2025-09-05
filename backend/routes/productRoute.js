import express from "express";
import {
  listProducts,
  addProduct,
  removeProduct,
  singleProduct,
  addReview,
  getReviews,
  updateProduct,
  updateFavorite,
  getFavorites,
} from "../controllers/productController.js";

import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js";

const productRouter = express.Router();

// Product CRUD
productRouter.post(
  "/add",
  adminAuth,
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
    { name: "image5", maxCount: 1 },
  ]),
  addProduct
);

productRouter.post("/remove", adminAuth, removeProduct);
productRouter.post("/single", singleProduct);
productRouter.get("/list", listProducts);

// ⭐ Update product route
productRouter.put(
  "/update/:id",
  adminAuth,
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
    { name: "image5", maxCount: 1 },
  ]),
  updateProduct
);

// ⭐ Reviews Routes
productRouter.post("/:id/review", authUser, addReview); // add review
productRouter.get("/:id/reviews", getReviews); // fetch reviews
productRouter.put("/favorite/:id", updateFavorite); // update favorite status
productRouter.get("/favorites", getFavorites);

export default productRouter;
