import React from "react";
import Title from "./Title";
import { FaShippingFast, FaGem } from "react-icons/fa";
import { MdCurrencyRupee } from "react-icons/md";

const OurPolicy = () => {
  return (
    <div className="my-20">
      <div className="text-3xl text-center py-10">
        <Title text1={"Why to"} text2={"choose us"} />
      </div>
      <div className="flex flex-col sm:flex-row justify-around gap-12 sm:gap-2 text-center py-10 text-xs sm:text-sm md:text-base text-gray-700">
        <div className="flex flex-col items-center">
          <FaShippingFast size={35} className="mb-3" />
          <p className=" font-semibold">Pan India Delevery</p>
          <p className=" text-gray-400">
            We delever the products all over india.
          </p>
        </div>
        <div className="flex flex-col items-center">
          <FaGem size={35} className="mb-3" />
          <p className=" font-semibold">High-Quality Products</p>
          <p className=" text-gray-400">
            We handpick only the best quality items for our store. .
          </p>
        </div>
        <div className="flex flex-col items-center">
          <MdCurrencyRupee size={35} className="mb-3" />
          <p className=" font-semibold">Affordable Prices</p>
          <p className=" text-gray-400">
            Best value deals for every budget and need.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OurPolicy;
