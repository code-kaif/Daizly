import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { ShopContext } from "../context/ShopContext";

const Hero = () => {
  const { navigate } = useContext(ShopContext);
  return (
    <div className="flex flex-col-reverse sm:flex-row border border-gray-200 bg-[#0D0D0D] h-auto sm:h-[80vh]">
      {/* Hero Left Side */}
      <div className="w-full sm:w-1/2 flex items-center justify-center py-10 px-6 sm:px-12">
        <div className="text-white text-center sm:text-left">
          {/* Small Top Line */}
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
            <p className="w-8 md:w-11 h-[2px] bg-white"></p>
            <p className="font-medium text-sm md:text-base">
              Best Leather Jackets
            </p>
          </div>

          {/* Title */}
          <h1 className="prata-regular text-4xl sm:text-5xl lg:text-6xl leading-tight mb-4">
            DAIZLY
          </h1>

          {/* CTA */}
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <p
              onClick={() => navigate("/collection")}
              className="font-semibold text-sm md:text-base cursor-pointer"
            >
              SHOP NOW
            </p>
            <p className="w-8 md:w-11 h-[1px] bg-white"></p>
          </div>
        </div>
      </div>

      {/* Hero Right Side */}
      <div className="w-full sm:w-1/2 flex justify-center items-center">
        <img
          className="w-full h-auto md:max-h-full max-h-[400px] sm:h-full object-cover"
          src={assets.tag}
          alt="Leather Jacket"
        />
      </div>
    </div>
  );
};

export default Hero;
