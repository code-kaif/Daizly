import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";
import { useDevice } from "../hooks/useDevice";

const ProductItem = ({
  id,
  image = [],
  name,
  discount,
  stockStatus = "In stock",
}) => {
  const { currency } = useContext(ShopContext);
  const { shouldShowVideos } = useDevice();

  const status = String(stockStatus).trim().toLowerCase(); // normalize
  const isComingSoon = status === "coming soon" || status === "coming_soon";
  const isOutOfStock = status === "out of stock" || status === "out_of_stock";
  const showBadge = isComingSoon || isOutOfStock;

  // Check if file is a video
  const isVideoFile = (url) => {
    return url && (url.includes(".mp4") || url.includes("video/upload"));
  };

  return (
    <Link
      onClick={() => scrollTo(0, 0)}
      className="text-gray-700 cursor-pointer"
      to={`/product/${id}`}
    >
      <div className="overflow-hidden rounded-md bg-white shadow-sm">
        <div className="relative w-full aspect-[4/5] bg-gray-100">
          {/* Primary media */}
          {image?.[0] &&
            (isVideoFile(image[0]) && shouldShowVideos ? (
              <video
                src={image[0]}
                className="h-full w-full object-cover absolute inset-0 transition-opacity duration-300 opacity-100 md:hover:opacity-0"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : isVideoFile(image[0]) ? (
              // For iOS and social media: Show first image instead of video
              <img
                src={image.find((img) => !isVideoFile(img)) || image[0]}
                alt={name}
                className="h-full w-full object-cover absolute inset-0 transition-opacity duration-300 opacity-100"
              />
            ) : (
              <img
                src={image[0]}
                alt={name}
                className="h-full w-full object-cover absolute inset-0 transition-opacity duration-300 opacity-100 md:hover:opacity-0"
              />
            ))}

          {/* Hover media - Only show for non-iOS/non-social media */}
          {image?.[1] &&
            shouldShowVideos &&
            (isVideoFile(image[1]) ? (
              <video
                src={image[1]}
                className="h-full w-full object-cover absolute inset-0 transition-opacity duration-300 opacity-0 md:hover:opacity-100"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <img
                src={image[1]}
                alt={name}
                className="h-full w-full object-cover absolute inset-0 transition-opacity duration-300 opacity-0 md:hover:opacity-100"
              />
            ))}

          {/* Center badge for Coming Soon / Out of Stock */}
          {showBadge && (
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
              <div
                className={`flex items-center justify-center w-20 h-20 rounded-full text-white text-xs font-semibold shadow-lg ${
                  isComingSoon ? "bg-green-600" : "bg-red-600"
                }`}
              >
                {isComingSoon ? "Coming Soon" : "Out of Stock"}
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="pt-3 pb-1 text-sm line-clamp-1 text-white">{name}</p>
      <p className="text-sm font-medium text-white">
        {currency}
        {discount}
      </p>
    </Link>
  );
};

export default ProductItem;
