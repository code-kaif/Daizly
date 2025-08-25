import React from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  return (
    <div>
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm">
        <div>
          <img src={assets.logo} className="w-20 mb-5" />
          <p className="w-full md:w-2/3 text-[#fff]">
            DAIZLY is your ultimate destination for stylish, premium-quality,
            and affordable products. From everyday essentials to statement
            pieces, we bring you the latest trends with a touch of
            elegance—delivered right to your doorstep.
          </p>
        </div>

        <div className="text-[#fff]">
          <p className="text-xl font-medium mb-5">POLICY</p>
          <ul className="flex flex-col gap-1 cursor-pointer">
            <li onClick={() => navigate("/privacy-policy")}>Privacy policy</li>
            <li onClick={() => navigate("/return-policy")}>Return policy</li>
            <li onClick={() => navigate("/shipping-policy")}>
              Shipping policy
            </li>
          </ul>
        </div>

        <div className="text-[#fff]">
          <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
          <ul className="flex flex-col gap-1">
            <li>+91 93159 43603</li>
            <li>daizly01@gmail.com</li>
          </ul>
        </div>
      </div>

      <div>
        <hr />
        <p className="py-5 text-sm text-center text-[#fff]">
          Copyright 2025 daizly01@gmail.com - All Right Reserved.
        </p>
      </div>
    </div>
  );
};

export default Footer;
