import React from "react";
import Title from "./Title";
import { FaShippingFast, FaGem } from "react-icons/fa";
import { MdCurrencyRupee } from "react-icons/md";

const OurPolicy = () => {
  return (
    <div className="my-20 bg-[#0E0505] text-white">
      {/* Section Title */}
      <div className="text-3xl text-center py-10">
        <Title text1={"Why to"} text2={"choose us"} />
      </div>

      {/* Policy Items */}
      <div className="flex flex-col sm:flex-row justify-around gap-12 sm:gap-6 text-center py-10 text-sm md:text-base">
        <div className="flex flex-col items-center px-4">
          <FaShippingFast
            size={40}
            className="mb-3 text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]"
          />
          <p className="font-semibold text-lg">Pan India Delivery</p>
          <p className="text-gray-400">We deliver products all over India.</p>
        </div>

        <div className="flex flex-col items-center px-4">
          <FaGem
            size={40}
            className="mb-3 text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]"
          />
          <p className="font-semibold text-lg">High-Quality Products</p>
          <p className="text-gray-400">
            We handpick only the best quality items for our store.
          </p>
        </div>

        <div className="flex flex-col items-center px-4">
          <MdCurrencyRupee
            size={40}
            className="mb-3 text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]"
          />
          <p className="font-semibold text-lg">Affordable Prices</p>
          <p className="text-gray-400">
            Best value deals for every budget and need.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OurPolicy;
