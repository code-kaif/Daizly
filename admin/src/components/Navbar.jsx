import React from "react";
import { assets } from "../assets/assets";

const Navbar = ({ setToken }) => {
  return (
    <div className="flex items-center py-2 px-[4%] justify-between">
      <div>
        <img className="w-24" src={assets.daizlylogo} alt="FV7 Logo" />
        <h3 className="text-gray-200 text-sm font-medium">Admin Panel</h3>
      </div>
      <button
        onClick={() => setToken("")}
        className="bg-[#005530] hover:bg-green-800 text-white rounded-full px-5 py-2 sm:px-7 sm:py-2 text-xs sm:text-sm"
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;
