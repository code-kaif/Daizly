import axios from "axios";
import React, { useState } from "react";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Login = ({ setToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      const response = await axios.post(backendUrl + "/api/user/admin", {
        email,
        password,
      });
      if (response.data.success) {
        setToken(response.data.token);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center w-full">
      <div className="bg-[#0E0505] shadow-md rounded-lg px-8 py-6 max-w-md border">
        <h1 className="text-2xl font-bold mb-4 text-white">Admin Panel</h1>
        <form onSubmit={onSubmitHandler}>
          <div className="mb-3 min-w-72">
            <p className="text-sm font-medium text-gray-200 mb-2">
              Email Address
            </p>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className="w-full bg-[#1A0E0E] border border-gray-700 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-white placeholder-gray-500"
              type="email"
              placeholder="your@email.com"
              required
            />
          </div>
          <div className="mb-3 min-w-72">
            <p className="text-sm font-medium text-gray-200 mb-2">Password</p>
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className="w-full bg-[#1A0E0E] border border-gray-700 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-white placeholder-gray-500"
              type="password"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            className="mt-2 w-full py-2 px-4 bg-[#005530] hover:bg-green-800 text-white rounded-md"
            type="submit"
          >
            {" "}
            Login{" "}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
