import React from "react";
import { assets } from "../assets/assets";
import Title from "./Title";

const images = [
  { src: assets.gallery1, title: "Jacket" },
  { src: assets.frontview, title: "Shacket" },
  { src: assets.gal1, title: "T-shirt" },
  { src: assets.gal2, title: "Shirt" },
  { src: assets.gal3, title: "Swetshirt" },
  { src: assets.gal4, title: "Hoodie" },
];

const Gallery = () => {
  return (
    <div className="min-h-screen text-white flex items-center justify-center">
      <div className="max-w-6xl w-full">
        <div className="text-center text-3xl py-8">
          <Title text1={"GALLERY"} text2={""} />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((img, i) => (
            <div
              key={i}
              className="relative group overflow-hidden rounded-xl shadow-lg cursor-pointer"
            >
              <img
                src={img.src}
                alt={img.title}
                className="w-full h-48 md:h-56 object-cover transform group-hover:scale-110 transition-transform duration-500"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-4">
                <h3 className="text-lg font-semibold">{img.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gallery;
