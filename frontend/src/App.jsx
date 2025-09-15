import React, { createContext, useContext, useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Collection from "./pages/Collection";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import PlaceOrder from "./pages/PlaceOrder";
import Orders from "./pages/Orders";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SearchBar from "./components/SearchBar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Verify from "./pages/Verify";
import ForgotPassword from "./components/ForgetPassword";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ScrollToTop from "./components/ScrollToTop";
import ReturnPolicy from "./pages/ReturnPolicy";
import ShippingPolicy from "./pages/ShippingPolicy";
import WhatsAppButton from "./components/WattsAppButton";
import Favorite from "./pages/Favorite";

// Create context for device detection
export const DeviceContext = createContext();

const App = () => {
  const [isInstagramBrowser, setIsInstagramBrowser] = useState(false);

  useEffect(() => {
    // Detect ONLY Instagram in-app browser
    const userAgent = navigator.userAgent.toLowerCase();
    const isInstagram = userAgent.includes("instagram");

    console.log("User Agent:", navigator.userAgent);
    console.log("Is Instagram Browser:", isInstagram);

    setIsInstagramBrowser(isInstagram);
  }, []);

  return (
    <DeviceContext.Provider value={{ isInstagramBrowser }}>
      <>
        <div className="fixed top-0 left-0 w-full z-50">
          <div className="bg-black md:text-[16px] text-[12px] text-white text-center py-3">
            USE DAIZLY20 TO GET 20% OFF (ONLY FOR PREPAID ORDERS)
          </div>
          <div className="bg-[#005530] px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
            <Navbar />
          </div>
        </div>
        <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] bg-black pt-[130px] md:pt-[150px]">
          <ToastContainer />
          <SearchBar />
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/product/:productId" element={<Product />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/place-order" element={<PlaceOrder />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/return-policy" element={<ReturnPolicy />} />
            <Route path="/shipping-policy" element={<ShippingPolicy />} />
            <Route path="/favorite" element={<Favorite />} />
          </Routes>
          <WhatsAppButton />
          <Footer />
        </div>
      </>
    </DeviceContext.Provider>
  );
};

export default App;
