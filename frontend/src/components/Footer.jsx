import React from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  return (
    <div>
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm">
        <div>
          <img src={assets.fv7logo} className="w-20 mb-5" />
          <p className="w-full md:w-2/3 text-gray-600">
            FashionVilla7 is your ultimate destination for trendy, affordable,
            and high-quality fashion. From everyday essentials to statement
            pieces, we bring the latest styles directly to your doorstep.
            Discover fashion that fits your vibe—without the hassle.
          </p>
        </div>

        <div>
          <p className="text-xl font-medium mb-5">COMPANY</p>
          <ul className="flex flex-col gap-1 text-gray-600 cursor-pointer">
            <li onClick={() => navigate("/")}>Home</li>
            <li onClick={() => navigate("/about")}>About us</li>
            <li onClick={() => navigate("/privacy-policy")}>Privacy policy</li>
          </ul>
        </div>

        <div>
          <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li>+91 7827775050</li>
            <li>admin@fashionvilla7.in</li>
          </ul>
        </div>
      </div>

      <div>
        <hr />
        <p className="py-5 text-sm text-center">
          Copyright 2025 @fashionvilla7.in - All Right Reserved.
        </p>
      </div>
    </div>
  );
};

export default Footer;
