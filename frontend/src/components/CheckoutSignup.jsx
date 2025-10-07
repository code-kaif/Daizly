// components/CheckoutSignup.jsx
import React, { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import Title from "./Title";
import { useNavigate } from "react-router-dom";

const CheckoutSignup = ({ onSignupSuccess }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const { backendUrl, cartItems, setToken, setCartItems } =
    useContext(ShopContext);

  // CheckoutSignup.jsx - UPDATED success handler
  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(backendUrl + "/api/user/register", {
        name,
        email,
        password,
        cartData: cartItems,
      });

      if (response.data.success) {
        const token = response.data.token;
        setToken(token);
        localStorage.setItem("token", token); // Ensure token is saved to localStorage

        // Update cart items with the user's cart data
        if (response.data.cartData) {
          setCartItems(response.data.cartData);
        }
        onSignupSuccess();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-8">
      <div className="text-2xl mb-8">
        <Title text1={"CREATE"} text2={"ACCOUNT"} />
      </div>

      <form onSubmit={onSubmitHandler} className="w-full max-w-md space-y-4">
        <div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            required
            className="w-full px-4 py-3 border border-gray-700 rounded bg-[#1A0E0E] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>

        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            required
            className="w-full px-4 py-3 border border-gray-700 rounded bg-[#1A0E0E] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full px-4 py-3 border border-gray-700 rounded bg-[#1A0E0E] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-sm text-gray-400 hover:text-white"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-[#005530] hover:bg-green-800 text-white rounded-md transition disabled:opacity-50"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin h-5 w-5 mr-3 text-white"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
                ></path>
              </svg>
              Creating Account...
            </div>
          ) : (
            "Create Account & Continue"
          )}
        </button>
      </form>

      <div className="mt-4 text-center text-gray-400">
        <div>
          Already have an account?{" "}
          <a
            onClick={() => navigate("/login")}
            className="text-green-900 cursor-pointer font-semibold"
          >
            Login
          </a>{" "}
        </div>
        <p className="text-sm">
          By creating an account, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
};

export default CheckoutSignup;
