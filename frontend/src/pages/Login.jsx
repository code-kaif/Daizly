import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const [currentState, setCurrentState] = useState("Login");
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      const url =
        currentState === "Sign Up"
          ? backendUrl + "/api/user/register"
          : backendUrl + "/api/user/login";

      const payload =
        currentState === "Sign Up"
          ? { name, email, password }
          : { email, password };

      const response = await axios.post(url, payload);
      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token]);

  const isLogin = currentState === "Login";

  return (
    <div className="flex h-[80vh] items-center justify-center px-4 bg-[#0E0505]">
      <div className="w-full max-w-2xl bg-[#1a0f0f] shadow-lg rounded-lg p-8 text-white transition-all duration-500">
        {/* Toggle Buttons */}
        <div className="flex justify-between mb-8">
          <button
            onClick={() => setCurrentState("Login")}
            className={`w-1/2 py-2 font-medium transition border-b-2 ${
              isLogin
                ? "border-white text-white"
                : "border-transparent text-gray-400"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setCurrentState("Sign Up")}
            className={`w-1/2 py-2 font-medium transition border-b-2 ${
              !isLogin
                ? "border-white text-white"
                : "border-transparent text-gray-400"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmitHandler} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              required
              className="w-full px-4 py-2 border rounded bg-[#0E0505] text-white placeholder-gray-400 focus:outline-none focus:ring focus:ring-gray-600"
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            required
            className="w-full px-4 py-2 border rounded bg-[#0E0505] text-white placeholder-gray-400 focus:outline-none focus:ring focus:ring-gray-600"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full px-4 py-2 border rounded bg-[#0E0505] text-white placeholder-gray-400 focus:outline-none focus:ring focus:ring-gray-600"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2 text-sm text-gray-400 hover:text-white"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {isLogin && (
            <div className="text-right text-sm">
              <button
                onClick={() => navigate("/forgot-password")}
                className="text-blue-400 hover:underline text-sm"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-md transition"
          >
            {isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
