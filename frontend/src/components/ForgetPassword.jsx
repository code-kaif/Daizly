// pages/ForgotPassword.jsx
import React, { useContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1 = ask email, 2 = ask OTP & new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const { token, backendUrl } = useContext(ShopContext);
  const navigate = useNavigate();

  const sendOtp = async () => {
    try {
      const res = await axios.post(`${backendUrl}/api/user/forgot-password`, {
        email,
      });
      if (res.data.success) {
        toast.success(res.data.message);
        setStep(2);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    }
  };

  const resetPassword = async () => {
    try {
      const res = await axios.post(`${backendUrl}/api/user/reset-password`, {
        email,
        otp,
        newPassword,
      });
      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/login");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 h-[70vh]">
      <h2 className="text-2xl font-semibold text-gray-800">Forgot Password</h2>
      {step === 1 ? (
        <>
          <input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-72 px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-gray-300"
          />
          <button
            onClick={sendOtp}
            className="bg-gray-800 hover:bg-gray-950 duration-200 rounded-md text-white px-16 py-3 text-sm"
          >
            Send OTP
          </button>
        </>
      ) : (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-72 px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-gray-300"
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-72 px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-gray-300"
          />
          <button
            onClick={resetPassword}
            className="bg-gray-800 hover:bg-gray-950 duration-200 rounded-md text-white px-16 py-3 text-sm"
          >
            Reset Password
          </button>
        </>
      )}
    </div>
  );
};

export default ForgotPassword;
