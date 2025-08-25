import React from "react";
import { assets } from "../assets/assets";
import Title from "./Title";

const GallerySection = () => {
  return (
    <>
      <div className="text-center text-3xl py-8">
        <Title text1={"Gallery"} text2={""} />
      </div>
      <section className="w-full flex justify-center py-16 bg-[#0D0D0D]">
        <div className="relative w-[90%] md:w-[75%] h-[460px] rounded-3xl shadow-[0_0_50px_rgba(255,255,255,0.05)] overflow-hidden flex items-center justify-center">
          {/* Decorative glow */}
          <div className="absolute inset-0 bg-gradient-to-tr via-transparent opacity-50 blur-3xl"></div>

          {/* Image 1 */}
          <img
            src={assets.gallery1}
            alt="Gallery 1"
            className="absolute top-10 left-14 w-64 h-44 object-cover rounded-2xl shadow-[0_8px_30px_rgba(255,255,255,0.15)] transform rotate-[-10deg] transition-all duration-500 hover:scale-110 hover:rotate-[-5deg]"
          />

          {/* Image 2 (center, main focus) */}
          <img
            src={assets.gallery3}
            alt="Gallery 2"
            className="absolute top-20 right-14 w-72 h-52 object-cover rounded-2xl shadow-[0_8px_40px_rgba(255,255,255,0.2)] z-10 transform rotate-[8deg] transition-all duration-500 hover:scale-110 hover:rotate-[4deg]"
          />

          {/* Image 3 */}
          <img
            src={assets.gallery2}
            alt="Gallery 3"
            className="absolute bottom-10 left-[35%] w-80 h-56 object-cover rounded-2xl shadow-[0_8px_30px_rgba(255,255,255,0.15)] transform rotate-[-5deg] transition-all duration-500 hover:scale-110 hover:rotate-[-2deg]"
          />
        </div>
      </section>
    </>
  );
};

export default GallerySection;
