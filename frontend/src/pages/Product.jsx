import React, { useContext, useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import { Heart, ChevronLeft, ChevronRight, Play } from "lucide-react";
import axios from "axios";
import { useDevice } from "../hooks/useDevice";

const Product = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { products, currency, addToCart, token, backendUrl } =
    useContext(ShopContext);
  const { isInstagramBrowser } = useDevice();
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef(null);
  const [productData, setProductData] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [size, setSize] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  // Check screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🔥 Universal video detector (same as ProductItem)
  const isVideoItem = (item) => {
    if (!item) return false;

    if (typeof item === "object") {
      return item.mimeType?.startsWith("video/");
    }

    if (typeof item === "string") {
      return /\.(mp4|mov|webm|ogg|avi|mkv)$/i.test(item);
    }

    return false;
  };

  // Get URL from image object
  const getImageUrl = (img) => {
    if (!img) return null;

    // If it's an object with url property (new schema)
    if (typeof img === "object" && img.url) {
      return img.url;
    }

    // If it's already a string
    if (typeof img === "string") {
      return img;
    }

    return null;
  };

  // Get the actual image/video object (not just URL)
  const getImageObject = (img) => {
    if (!img) return null;

    // If it's already an object with url
    if (typeof img === "object" && img.url) {
      return {
        ...img,
        isVideo: isVideoItem(img),
      };
    }

    // If it's a string, create a simple object
    if (typeof img === "string") {
      return {
        url: img,
        isVideo: isVideoItem(img),
      };
    }

    return null;
  };

  // Fetch product details
  const fetchProductData = () => {
    const product = products.find((item) => item._id === productId);
    if (product) {
      setProductData(product);
      setCurrentImageIndex(0);
      setIsFavorite(product.isFavorite || false);
    }
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
  }, [productId, products]);

  // Get images array from either schema
  const getImagesArray = () => {
    if (!productData) return [];

    // Try new schema first
    if (productData.images && Array.isArray(productData.images)) {
      return productData.images;
    }

    // Fallback to old schema - convert strings to objects
    if (productData.image && Array.isArray(productData.image)) {
      return productData.image
        .map((img) => getImageObject(img))
        .filter(Boolean);
    }

    return [];
  };

  const images = getImagesArray();
  const currentImage = images[currentImageIndex];

  // Image navigation functions
  const nextImage = () => {
    if (images.length === 0) return;
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    if (images.length === 0) return;
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
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

  // FIXED: Toggle favorite function
  const toggleFavorite = async () => {
    if (!productData) return;
    try {
      const res = await axios.put(
        `${backendUrl}/api/product/favorite/${productData._id}`,
        { isFavorite: !isFavorite },
        { headers: { token } }
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

  // Track view content
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

  // Video auto-play when clicked on thumbnail
  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
    const clickedImage = images[index];
    if (clickedImage && clickedImage.isVideo) {
      // If the clicked item is a video, we'll let the video element handle autoplay
      setTimeout(() => {
        const videoElement = document.querySelector(".main-video video");
        if (videoElement) {
          videoElement.play().catch((e) => {
            console.log("Autoplay prevented:", e);
            // Show play button instead
          });
        }
      }, 100);
    }
  };

  if (!productData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0E0505]">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  text-white py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* ---------- Images Section ---------- */}
          <div className="lg:w-1/2">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Thumbnails - Vertical on desktop, horizontal on mobile */}
              {images.length > 0 && (
                <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:h-[500px] pb-2 md:pb-0 order-2 md:order-1">
                  {images.map((img, index) => {
                    const imgObj = getImageObject(img);
                    const isVideo = imgObj ? imgObj.isVideo : false;
                    const url = imgObj ? getImageUrl(imgObj) : null;

                    return (
                      <div
                        key={index}
                        onClick={() => handleThumbnailClick(index)}
                        className={`flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-lg cursor-pointer border-2 transition-all ${
                          currentImageIndex === index
                            ? "border-[#005530] ring-2 ring-[#005530] ring-opacity-50"
                            : "border-gray-700 hover:border-gray-500"
                        }`}
                      >
                        {url ? (
                          <div className="relative w-full h-full">
                            {isVideo ? (
                              <>
                                {/* Video thumbnail with play button */}
                                <div className="w-full h-full bg-gray-800 rounded-lg overflow-hidden">
                                  <video
                                    src={url}
                                    className="w-full h-full object-cover opacity-70"
                                    muted
                                    playsInline
                                    preload="metadata"
                                    onLoadedData={(e) => {
                                      // Try to set thumbnail from video
                                      const canvas =
                                        document.createElement("canvas");
                                      canvas.width = e.target.videoWidth;
                                      canvas.height = e.target.videoHeight;
                                      const ctx = canvas.getContext("2d");
                                      ctx.drawImage(
                                        e.target,
                                        0,
                                        0,
                                        canvas.width,
                                        canvas.height
                                      );
                                      // Don't set as background to avoid CORS issues
                                    }}
                                  />
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="bg-black bg-opacity-60 rounded-full p-2">
                                    <Play className="w-6 h-6 text-white" />
                                  </div>
                                </div>
                                <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                                  VID
                                </div>
                              </>
                            ) : (
                              <img
                                src={url}
                                className="w-full h-full object-cover rounded-lg"
                                alt={`Thumbnail ${index + 1}`}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src =
                                    "https://via.placeholder.com/96";
                                }}
                              />
                            )}
                          </div>
                        ) : (
                          <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center">
                            <span className="text-gray-500 text-xs">
                              No image
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Main Image/Video */}
              <div className="relative flex-1 order-1 md:order-2">
                {currentImage ? (
                  (() => {
                    const imgObj = getImageObject(currentImage);
                    const isVideo = imgObj ? imgObj.isVideo : false;
                    const url = imgObj ? getImageUrl(imgObj) : null;

                    if (isVideo && url) {
                      return (
                        <div className="relative main-video">
                          <div className="aspect-square md:aspect-[4/5] lg:aspect-square rounded-xl overflow-hidden bg-black">
                            <video
                              src={url}
                              className="w-full h-full object-contain"
                              controls
                              autoPlay
                              muted
                              playsInline
                              preload="metadata"
                              onPlay={() => setVideoPlaying(true)}
                              onPause={() => setVideoPlaying(false)}
                            />
                          </div>
                        </div>
                      );
                    } else if (url) {
                      return (
                        <div className="aspect-square md:aspect-[4/5] lg:aspect-square rounded-xl overflow-hidden bg-gray-900">
                          <img
                            src={url}
                            alt={productData.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/500";
                            }}
                          />
                        </div>
                      );
                    } else {
                      return (
                        <div className="aspect-square md:aspect-[4/5] lg:aspect-square bg-gray-900 rounded-xl flex items-center justify-center">
                          <span className="text-gray-500">
                            No image available
                          </span>
                        </div>
                      );
                    }
                  })()
                ) : (
                  <div className="aspect-square md:aspect-[4/5] lg:aspect-square bg-gray-900 rounded-xl flex items-center justify-center">
                    <span className="text-gray-500">No image available</span>
                  </div>
                )}

                {/* Navigation Arrows - Only show on mobile or when multiple images */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className={`absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-3 rounded-full transition-all ${
                        isMobile ? "block" : "hidden md:block"
                      }`}
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={nextImage}
                      className={`absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-3 rounded-full transition-all ${
                        isMobile ? "block" : "hidden md:block"
                      }`}
                      aria-label="Next image"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ---------- Product Info ---------- */}
          <div className="lg:w-1/2 lg:pl-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="font-bold text-3xl md:text-4xl text-white">
                {productData.name}
              </h1>
              <button
                onClick={toggleFavorite}
                className={`p-3 rounded-full transition ${
                  isFavorite
                    ? "bg-red-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <Heart size={24} fill={isFavorite ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              <span
                className={`inline-block px-4 py-1 rounded-full text-sm font-medium ${
                  productData.stockStatus === "In stock"
                    ? "bg-green-900 text-green-100"
                    : productData.stockStatus === "Coming soon"
                    ? "bg-yellow-900 text-yellow-100"
                    : "bg-red-900 text-red-100"
                }`}
              >
                {productData.stockStatus || "In stock"}
              </span>
            </div>

            {/* Price */}
            <div className="mb-8">
              <div className="flex items-center gap-4">
                <p className="text-4xl md:text-5xl font-bold text-[#005530]">
                  {currency} {productData.discount}
                </p>
                {productData.price &&
                  productData.price !== productData.discount && (
                    <p className="text-2xl text-gray-400 line-through">
                      {currency} {productData.price}
                    </p>
                  )}
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-3">
                Description
              </h3>
              <div
                className="text-gray-300 leading-relaxed whitespace-pre-line"
                dangerouslySetInnerHTML={{
                  __html: productData.description.replace(
                    /\r\n|\n|\r/g,
                    "<br/>"
                  ),
                }}
              />
            </div>

            {/* Sizes */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">
                Select Size
              </h3>
              <div className="flex flex-wrap gap-3">
                {(productData.sizes || []).map((item, index) => (
                  <button
                    onClick={() => setSize(item)}
                    className={`min-w-[60px] py-3 px-4 rounded-lg border-2 transition-all font-medium ${
                      item === size
                        ? "border-[#005530] bg-[#005530] text-white"
                        : "border-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-800"
                    } ${
                      productData.stockStatus !== "In stock"
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    key={index}
                    disabled={productData.stockStatus !== "In stock"}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="mb-8">
              <button
                onClick={handleAddToCart}
                disabled={productData.stockStatus !== "In stock" || !size}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                  productData.stockStatus === "In stock" && size
                    ? "bg-[#005530] hover:bg-green-800 text-white"
                    : "bg-gray-800 text-gray-400 cursor-not-allowed"
                }`}
              >
                {productData.stockStatus === "In stock"
                  ? size
                    ? "ADD TO CART"
                    : "SELECT A SIZE"
                  : productData.stockStatus === "Coming soon"
                  ? "COMING SOON"
                  : "OUT OF STOCK"}
              </button>
            </div>

            {/* Features */}
            <div className="border-t border-gray-800 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Features
              </h3>
              <div className="space-y-3 text-gray-300">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>100% Original Products</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Cash on Delivery Available</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Easy Returns & Exchanges within 7 Days</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Free Shipping on orders above {currency}1999</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- Review Section ---------- */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-8">
            Customer Reviews
          </h2>

          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-[#1A0E0E] rounded-xl border border-gray-800">
              <p className="text-gray-400 text-lg mb-4">No reviews yet</p>
              <p className="text-gray-500">
                Be the first to review this product!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {reviews.map((rev, index) => (
                <div
                  key={index}
                  className="bg-[#1A0E0E] border border-gray-800 rounded-xl p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <strong className="text-white text-lg">
                        {rev.user?.name || "Anonymous"}
                      </strong>
                      <p className="text-gray-400 text-sm">
                        {new Date(rev.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-yellow-400 text-xl mr-2">
                        {"⭐".repeat(rev.rating)}
                      </span>
                      <span className="text-gray-400">({rev.rating}/5)</span>
                    </div>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}

          {/* Review Form */}
          <div className="bg-[#1A0E0E] border border-gray-800 rounded-xl mt-10 p-6 md:p-8">
            <h3 className="text-xl font-semibold text-white mb-6">
              Write a Review
            </h3>
            <form onSubmit={handleReviewSubmit}>
              <div className="mb-6">
                <label className="block text-gray-300 mb-3">Your Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-3xl transition-transform hover:scale-110 ${
                        rating >= star ? "text-yellow-400" : "text-gray-700"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-300 mb-3">Your Review</label>
                <textarea
                  className="w-full bg-[#0E0505] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-gray-500 text-white placeholder-gray-500 min-h-[120px]"
                  placeholder="Share your experience with this product..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!token || !rating || !comment}
                className={`px-8 py-3 rounded-lg font-medium transition-all ${
                  token && rating && comment
                    ? "bg-[#005530] hover:bg-green-800 text-white"
                    : "bg-gray-800 text-gray-400 cursor-not-allowed"
                }`}
              >
                {token ? "Submit Review" : "Login to Review"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
