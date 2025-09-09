import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";

const Product = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { products, currency, addToCart, token, backendUrl } =
    useContext(ShopContext);

  const [productData, setProductData] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [size, setSize] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  // Check screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch product details
  const fetchProductData = () => {
    products.forEach((item) => {
      if (item._id === productId) {
        setProductData(item);
        setCurrentImageIndex(0);
      }
    });
  };

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/product/${productId}/reviews`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load reviews");
    }
  };

  useEffect(() => {
    fetchProductData();
    fetchReviews();
    // eslint-disable-next-line
  }, [productId, products]);

  // Image navigation functions
  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === productData.image.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? productData.image.length - 1 : prevIndex - 1
    );
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (productData) {
        if (e.key === "ArrowRight") {
          nextImage();
        } else if (e.key === "ArrowLeft") {
          prevImage();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [productData]);

  // Add to cart
  const handleAddToCart = () => {
    if (!size) {
      toast.info("Please select a size.");
      return;
    }

    addToCart(productData._id, size);
    toast.success("Added to cart");

    // 🔹 Fire Meta AddToCart
    if (window.fbq) {
      window.fbq("track", "AddToCart", {
        content_ids: [productData._id],
        content_type: "product",
        value: productData.discount,
        currency: "INR",
      });
    }

    navigate("/cart");
  };

  // Submit review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Please login to write a review");
      return;
    }
    if (!rating || !comment) {
      toast.error("Please add rating and comment");
      return;
    }

    try {
      const res = await fetch(`${backendUrl}/api/product/${productId}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Review submitted!");
        setRating(0);
        setComment("");
        fetchReviews();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  const [isFavorite, setIsFavorite] = useState(false);

  // Sync initial favorite status when product loads
  useEffect(() => {
    if (productData) {
      setIsFavorite(productData.isFavorite || false);
    }
  }, [productData]);

  // Toggle favorite API
  const toggleFavorite = async () => {
    try {
      const res = await axios.put(
        `${backendUrl}/api/product/favorite/${productData._id}`,
        { isFavorite: !isFavorite }
      );
      if (res.data.success) {
        setIsFavorite(!isFavorite);
        toast.success(
          !isFavorite ? "Added to favorites" : "Removed from favorites"
        );
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to update favorite");
    }
  };

  useEffect(() => {
    if (productData && window.fbq) {
      window.fbq("track", "ViewContent", {
        content_ids: [productData._id],
        content_type: "product",
        value: productData.discount,
        currency: "INR",
      });
    }
  }, [productData]);

  return productData ? (
    <div className="border-t-2 pt-12 transition-opacity ease-in duration-500 opacity-100">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* ---------- Images ---------- */}
        <div className="flex-1 flex flex-col-reverse gap-4 lg:flex-row">
          <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:w-[18%] w-full">
            {productData.image.map((item, index) => (
              <div
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-24 h-24 rounded-lg cursor-pointer border transition-all ${
                  currentImageIndex === index
                    ? "border-gray-800 ring-2 ring-[#005530]"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                {item.includes(".mp4") || item.includes("video/upload") ? (
                  <video
                    src={item}
                    className="w-full h-full object-cover rounded-lg"
                    muted
                  />
                ) : (
                  <img
                    src={item}
                    className="w-full h-full object-cover rounded-lg"
                    alt={`Thumbnail ${index + 1}`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="w-full lg:w-[75%] relative">
            {/* Main Image with Navigation */}
            <div className="relative group">
              {productData.image[currentImageIndex].includes(".mp4") ||
              productData.image[currentImageIndex].includes("video/upload") ? (
                <video
                  src={productData.image[currentImageIndex]}
                  className="w-full rounded-lg shadow-md"
                  controls
                  autoPlay
                  loop
                />
              ) : (
                <img
                  src={productData.image[currentImageIndex]}
                  className="w-full rounded-lg shadow-md transition-transform duration-300 group-hover:scale-[1.02]"
                  alt={productData.name}
                />
              )}

              {/* Navigation Arrows - Always visible on mobile */}
              {productData.image.length > 1 && (
                <>
                  {/* Left Arrow */}
                  <button
                    onClick={prevImage}
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full ${
                      isMobile
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    } transition-opacity duration-300`}
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={24} />
                  </button>

                  {/* Right Arrow */}
                  <button
                    onClick={nextImage}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full ${
                      isMobile
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    } transition-opacity duration-300`}
                    aria-label="Next image"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}

              {/* Image Counter */}
              {productData.image.length > 1 && (
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {productData.image.length}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ---------- Product Info ---------- */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h1 className="font-semibold text-3xl text-gray-200">
              {productData.name}
            </h1>

            <button
              onClick={toggleFavorite}
              className={`p-2 rounded-full transition ${
                isFavorite
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              <Heart size={22} fill={isFavorite ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Stock Status */}
          <p
            className={`mb-3 font-medium ${
              productData.stockStatus === "In stock" ||
              productData.stockStatus === "Coming soon"
                ? "text-green-900"
                : "text-red-500"
            }`}
          >
            {productData.stockStatus || "In stock"}
          </p>

          <div className="flex">
            <p className="text-3xl font-bold text-gray-200 mb-4 line-through mr-3">
              {currency}
              {productData.price}
            </p>

            <p className="text-3xl font-bold text-[#005530] mb-4">
              {currency}
              {productData.discount}
            </p>
          </div>

          <div
            className="text-gray-200 text-sm md:w-4/5 leading-relaxed mb-6"
            dangerouslySetInnerHTML={{
              __html: productData.description.replace(/\r\n|\n|\r/g, "<br/>"),
            }}
          />

          <div className="flex flex-col gap-3 my-6">
            {productData.stockStatus === "In stock" ? (
              <p className="font-medium text-gray-200">Select Size:</p>
            ) : (
              ""
            )}
            <div className="flex gap-2 flex-wrap">
              {productData.stockStatus === "In stock"
                ? productData.sizes.map((item, index) => (
                    <button
                      onClick={() => setSize(item)}
                      className={`border py-2 px-5 rounded-lg transition ${
                        item === size
                          ? "border-gray-800 bg-[#005530] text-white"
                          : "border-gray-300 bg-gray-100 hover:bg-gray-200"
                      }`}
                      key={index}
                    >
                      {item}
                    </button>
                  ))
                : ""}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={
                productData.stockStatus === "Out of stock" ||
                productData.stockStatus === "Coming soon"
              }
              className={`font-medium rounded-lg px-8 py-3 my-4 text-sm shadow-md transition ${
                productData.stockStatus === "In stock"
                  ? "bg-[#005530] hover:bg-green-800 text-white"
                  : "bg-gray-600 text-gray-300 cursor-not-allowed"
              }`}
            >
              {productData.stockStatus === "In stock"
                ? "ADD TO CART"
                : "Unable to Add"}
            </button>
          </div>

          <hr className="mt-6 sm:w-4/5" />
          <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
            <p>✔️ 100% Original product</p>
            <p>✔️ Cash on delivery available</p>
            <p>✔️ Easy return & exchange within 7 days</p>
          </div>
        </div>
      </div>

      {/* ---------- ✅ Review Section ---------- */}
      {productData.stockStatus === "In stock" && (
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Customer Reviews
          </h2>

          {reviews.length === 0 ? (
            <p className="text-gray-400">No reviews yet. Be the first!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev, index) => (
                <div
                  key={index}
                  className="border border-gray-700 rounded-lg p-4 bg-green-900 text-gray-200"
                >
                  <div className="flex justify-between items-center">
                    <strong>{rev.user?.name || "Anonymous"}</strong>
                    <span className="text-yellow-400">
                      {"⭐".repeat(rev.rating)}{" "}
                      <span className="text-gray-400 text-sm">
                        ({rev.rating}/5)
                      </span>
                    </span>
                  </div>
                  <p className="mt-1 text-gray-200">{rev.comment}</p>
                  <small className="text-gray-200">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </small>
                </div>
              ))}
            </div>
          )}

          <form
            onSubmit={handleReviewSubmit}
            className="mt-6 bg-[#1A0E0E] border border-gray-700 p-4 rounded-lg"
          >
            <h3 className="text-lg font-medium text-white mb-3">
              Write a Review
            </h3>

            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-2xl transition ${
                    rating >= star ? "text-yellow-400" : "text-gray-500"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              className="w-full bg-[#1A0E0E] border border-gray-700 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-white placeholder-gray-500 mb-3"
              placeholder="Write your review..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />

            <button
              type="submit"
              className="bg-[#005530] hover:bg-green-800 text-white px-6 py-2 rounded-md shadow transition"
            >
              Submit Review
            </button>
          </form>
        </div>
      )}
    </div>
  ) : (
    <div className="opacity-0"></div>
  );
};

export default Product;
