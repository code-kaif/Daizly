import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Routes, Route, Navigate } from "react-router-dom";
import Add from "./pages/Add";
import List from "./pages/List";
import Orders from "./pages/Orders";
import Login from "./components/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Export from "./pages/Export";
import Cancel from "./pages/Cancel";
import EditProduct from "./components/EditProduct"; // <-- import edit page
import Coupon from "./pages/Coupon";

export const backendUrl = import.meta.env.VITE_BACKEND_URL;
export const currency = "₹";

const App = () => {
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : ""
  );

  useEffect(() => {
    localStorage.setItem("token", token);
  }, [token]);

  return (
    <div className="min-h-screen bg-[#0E0505]">
      <ToastContainer />
      {token === "" ? (
        <Login setToken={setToken} />
      ) : (
        <>
          <Navbar setToken={setToken} />
          <hr />
          <div className="flex w-full">
            <Sidebar />
            <div className="w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-200 text-base">
              <Routes>
                <Route path="/" element={<Navigate to="/add" replace />} />
                <Route path="/add" element={<Add token={token} />} />
                <Route path="/list" element={<List token={token} />} />
                <Route path="/orders" element={<Orders token={token} />} />
                <Route path="/exports" element={<Export token={token} />} />
                <Route path="/cancel" element={<Cancel token={token} />} />
                <Route path="/coupon" element={<Coupon token={token} />} />
                <Route
                  path="/edit/:id"
                  element={<EditProduct token={token} />}
                />
                {/* 👆 New edit product route */}
              </Routes>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
