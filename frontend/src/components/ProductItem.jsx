import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";

const ProductItem = ({ id, image, name, discount }) => {
  const { currency } = useContext(ShopContext);

  return (
    <Link
      onClick={() => scrollTo(0, 0)}
      className="text-gray-700 cursor-pointer"
      to={`/product/${id}`}
    >
      <div className="overflow-hidden rounded-md bg-white shadow-sm">
        <div className="w-full aspect-[4/5] bg-gray-100 flex items-center justify-center relative">
          {/* First image */}
          <img
            src={image[0]}
            alt={name}
            className="h-full w-full object-cover absolute inset-0 transition-opacity duration-300 opacity-100 md:hover:opacity-0"
          />
          <img
            src={image[1]}
            alt={name}
            className="h-full w-full object-cover absolute inset-0 transition-opacity duration-300 opacity-0 md:hover:opacity-100"
          />
        </div>
      </div>
      <p className="pt-3 pb-1 text-sm line-clamp-1 text-[#fff]">{name}</p>
      <p className="text-sm font-medium text-[#fff]">
        {currency}
        {discount}
      </p>
    </Link>
  );
};

export default ProductItem;
