import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import nodemailer from "nodemailer";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Route for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User doesn't exists" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = createToken(user._id);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Route for user register
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // checking user already exists or not
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    // validating email format & strong password
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password",
      });
    }

    // hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();

    const token = createToken(user._id);

    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Route for admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetToken = otp;
    user.tokenExpiry = Date.now() + 15 * 60 * 1000; // 15 min
    await user.save();

    await transporter.sendMail({
      from: `"UV7 Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset OTP",
      html: `<p>Your OTP is <b>${otp}</b>. It will expire in 15 minutes.</p>`,
    });

    res.json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await userModel.findOne({ email, resetToken: otp });

    if (!user || user.tokenExpiry < Date.now()) {
      return res.json({ success: false, message: "Invalid or expired OTP" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetToken = null;
    user.tokenExpiry = null;

    await user.save();
    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const contactForm = async (req, res) => {
  const { name, email, message } = req.body;
  try {
    await transporter.sendMail({
      from: `"Enquiry" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Enquiry from Website Contact Form",
      html: `<p>Name <b>${name}</b>. Email <b>${email}</b>. Message <b>${message}</b>.</p>`,
    });

    res.json({ success: true, message: "Message Sent Successfull" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  loginUser,
  registerUser,
  adminLogin,
  forgotPassword,
  resetPassword,
  contactForm,
};
