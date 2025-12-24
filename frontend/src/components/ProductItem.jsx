import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";

const ProductItem = ({
  id,
  image = [],
  images = [],
  name,
  discount,
  stockStatus = "In stock",
}) => {
  const { currency } = useContext(ShopContext);

  // Get images from either schema
  const getImages = () => {
    if (images?.length > 0) return images;
    return image || [];
  };

  const productImages = getImages();
  const image1 = productImages[0];
  const image2 = productImages[1];

  // 🔥 universal video detector
  const isVideoItem = (item) => {
    if (!item) return false;

    if (typeof item === "object") {
      return item.mimeType?.startsWith("video/");
    }

    if (typeof item === "string") {
      return /\.(mp4|mov|webm|ogg)$/i.test(item);
    }

    return false;
  };

  const getUrl = (item) => (typeof item === "string" ? item : item?.url);

  const status = stockStatus?.toLowerCase();
  const showBadge = status === "coming soon" || status === "out of stock";

  return (
    <Link to={`/product/${id}`} className="block group">
      <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-[4/5]">
        {/* FIRST MEDIA */}
        {image1 && (
          <div className="absolute inset-0 transition-all duration-500 group-hover:opacity-0">
            {isVideoItem(image1) ? (
              <video
                src={getUrl(image1)}
                muted
                loop
                playsInline
                preload="metadata"
                onMouseEnter={(e) => e.currentTarget.play()}
                onMouseLeave={(e) => {
                  e.currentTarget.pause();
                  e.currentTarget.currentTime = 0;
                }}
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={getUrl(image1)}
                alt={name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        )}

        {/* SECOND MEDIA (HOVER) */}
        {image2 && (
          <div className="absolute inset-0 opacity-0 transition-all duration-500 group-hover:opacity-100">
            {isVideoItem(image2) ? (
              <video
                src={getUrl(image2)}
                muted
                loop
                playsInline
                preload="metadata"
                onMouseEnter={(e) => e.currentTarget.play()}
                onMouseLeave={(e) => {
                  e.currentTarget.pause();
                  e.currentTarget.currentTime = 0;
                }}
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={getUrl(image2)}
                alt={`${name} alternate`}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        )}

        {/* STOCK BADGE */}
        {showBadge && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
            <div
              className={`px-4 py-2 rounded-full text-white text-sm ${
                status === "coming soon" ? "bg-green-600" : "bg-red-600"
              }`}
            >
              {status === "coming soon" ? "Coming Soon" : "Out of Stock"}
            </div>
          </div>
        )}
      </div>

      <div className="mt-3">
        <h3 className="text-white text-sm font-medium line-clamp-1">{name}</h3>
        <p className="text-white font-bold mt-1">
          {currency}
          {discount}
        </p>
      </div>
    </Link>
  );
};

export default ProductItem;
