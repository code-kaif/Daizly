import React from "react";
import { FaStar } from "react-icons/fa";
import Title from "./Title";
import { assets } from "../assets/assets";

const testimonials = [
  {
    name: "Irfan Rajput",
    feedback:
      "Absolutely love the shopping experience! The delivery was quick, the products were amazing quality, and support was super helpful.",
    image: assets.irfan,
    rating: 5,
  },
  {
    name: "Kaif",
    feedback:
      "Such a smooth checkout and great collection! Got exactly what I was looking for. Highly recommended.",
    image: assets.kaif,
    rating: 5,
  },
  {
    name: "Kuldeep Gupta",
    feedback:
      "The customer service was top-notch. I had a size issue and they helped me replace it quickly. Will shop again!",
    image: assets.kuldeep,
    rating: 4,
  },
];

const Testimonials = () => {
  return (
    <div className="py-16 px-4 sm:px-8 lg:px-16 bg-[#0E0505] text-white">
      {/* Section Title */}
      <div className="text-center mb-12">
        <div className="md:text-3xl text-2xl text-center py-10">
          <Title text1={"What our"} text2={"Customers say"} />
        </div>
      </div>

      {/* Testimonials Grid */}
      <div className="grid md:grid-cols-3 gap-10">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="bg-[#005530] hover:bg-green-800 shadow-lg shadow-black/40 rounded-2xl p-6 text-center 
                       transition transform hover:scale-[1.03] hover:shadow-white/20 duration-300"
          >
            <img
              src={testimonial.image}
              alt={testimonial.name}
              className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-2 border-white/20"
            />
            <h3 className="text-lg font-semibold text-white">
              {testimonial.name}
            </h3>
            <div className="flex justify-center my-2">
              {[...Array(testimonial.rating)].map((_, i) => (
                <FaStar
                  key={i}
                  className="text-yellow-400 drop-shadow-[0_0_4px_rgba(255,255,0,0.4)]"
                />
              ))}
            </div>
            <p className="text-gray-400 text-sm mt-2">{testimonial.feedback}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;
