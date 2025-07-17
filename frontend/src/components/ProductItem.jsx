import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";

const ProductItem = ({ id, image, name, price }) => {
  const { currency } = useContext(ShopContext);

  return (
    <Link
      onClick={() => scrollTo(0, 0)}
      className="text-gray-700 cursor-pointer"
      to={`/product/${id}`}
    >
      <div className="overflow-hidden rounded-md bg-white shadow-sm">
        <div className="w-full aspect-[4/5] bg-gray-100 flex items-center justify-center">
          <img
            src={image[0]}
            alt={name}
            className="h-full w-full object-cover hover:scale-110 transition-transform duration-300"
          />
        </div>
      </div>
      <p className="pt-3 pb-1 text-sm line-clamp-1">{name}</p>
      <p className="text-sm font-medium">
        {currency}
        {price}
      </p>
    </Link>
  );
};

export default ProductItem;
