import express from "express";
import {
  loginUser,
  registerUser,
  adminLogin,
  forgotPassword,
  resetPassword,
  contactForm,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/admin", adminLogin);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);
userRouter.post("/contact", contactForm);

export default userRouter;
