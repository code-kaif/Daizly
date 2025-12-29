import axios from "axios";
import React, { useEffect, useState } from "react";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FaRegEdit, FaTrashAlt, FaPlus, FaList } from "react-icons/fa";

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Helper function to get image URL from either old or new schema
  const getImageUrl = (product) => {
    // Try new schema first: product.images array of objects
    if (
      product.images &&
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      // Get the first image object's URL
      const firstImage = product.images[0];
      // Check if it's an object with url property
      if (firstImage && typeof firstImage === "object" && firstImage.url) {
        return firstImage.url;
      }
      // If it's a string (shouldn't happen with new schema but just in case)
      if (typeof firstImage === "string") {
        return firstImage;
      }
    }

    // Fallback to old schema: product.image array of strings
    if (
      product.image &&
      Array.isArray(product.image) &&
      product.image.length > 0
    ) {
      return product.image[0];
    }

    // Return a placeholder if no image found
    return "https://via.placeholder.com/48";
  };

  // Helper to check if URL is a video
  const isVideoUrl = (url) => {
    if (!url) return false;
    return (
      /\.(mp4|webm|ogg|mov|avi|wmv)$/i.test(url) ||
      url.includes("/video/") ||
      url.includes("video=true")
    );
  };

  // Fetch product list
  const fetchList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(backendUrl + "/api/product/list");
      if (response.data.success) {
        setList(response.data.products.reverse());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log("Fetch list error:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to load products"
      );
    } finally {
      setLoading(false);
    }
  };

  // Remove product
  const removeProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const response = await axios.post(
        backendUrl + "/api/product/remove",
        { id },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message || "Product deleted successfully");
        await fetchList(); // refresh list after delete
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log("Delete error:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete product"
      );
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="p-8 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-gray-400">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <FaList className="text-green-500" />
            All Products
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Manage your product inventory
          </p>
        </div>
        <button
          onClick={() => navigate("/add")}
          className="w-full sm:w-auto px-4 py-3 bg-green-900 hover:bg-green-800 rounded-md flex items-center justify-center gap-2 text-sm sm:text-base transition-colors"
        >
          <FaPlus />
          Add New Product
        </button>
      </div>

      {/* Desktop Table View - Improved responsive table */}
      <div className="hidden lg:block bg-[#1A0E0E] rounded-lg overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-[#0E0505] text-left text-gray-300">
                <th className="p-3 sm:p-4 text-sm font-medium">Product</th>
                <th className="p-3 sm:p-4 text-sm font-medium">Category</th>
                <th className="p-3 sm:p-4 text-sm font-medium">Price</th>
                <th className="p-3 sm:p-4 text-sm font-medium">Discount</th>
                <th className="p-3 sm:p-4 text-sm font-medium">Stock</th>
                <th className="p-3 sm:p-4 text-sm font-medium text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {list.map((item) => {
                const imageUrl = getImageUrl(item);
                const isVideo = isVideoUrl(imageUrl);
                const discountPercentage =
                  item.discount > 0
                    ? Math.round(
                        ((item.price - item.discount) / item.price) * 100
                      )
                    : 0;

                return (
                  <tr
                    key={item._id}
                    className="border-b border-gray-800 hover:bg-[#0E0505] transition-colors"
                  >
                    {/* Product Info */}
                    <td className="p-3 sm:p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-[#0E0505] flex items-center justify-center flex-shrink-0">
                          {isVideo ? (
                            <div className="relative w-full h-full">
                              <video
                                src={imageUrl}
                                className="w-full h-full object-cover"
                                muted
                                autoPlay
                                loop
                                playsInline
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs bg-black bg-opacity-50 px-1 rounded">
                                  VID
                                </span>
                              </div>
                            </div>
                          ) : (
                            <img
                              src={imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/64";
                              }}
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm sm:text-base truncate max-w-[200px]">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-400 truncate max-w-[180px]">
                            {item.description?.substring(0, 50) ||
                              "No description"}
                            ...
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-3 sm:p-4">
                      <span className="px-2 py-1 bg-gray-800 rounded text-xs sm:text-sm">
                        {item.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="p-3 sm:p-4">
                      <div className="flex flex-col">
                        <span
                          className={`${
                            item.discount
                              ? "line-through text-gray-400 text-xs"
                              : "text-sm sm:text-base"
                          }`}
                        >
                          {currency}
                          {item.price}
                        </span>
                        {item.discount > 0 && (
                          <span className="text-green-400 font-bold text-sm sm:text-base">
                            {currency}
                            {item.discount}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Discount */}
                    <td className="p-3 sm:p-4">
                      {item.discount > 0 ? (
                        <span className="text-green-400 font-medium text-sm sm:text-base">
                          {discountPercentage}% OFF
                        </span>
                      ) : (
                        <span className="text-gray-500 text-sm">-</span>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="p-3 sm:p-4">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`px-2 py-1 rounded-full text-xs w-fit ${
                            item.stockStatus === "In stock"
                              ? "bg-green-900/30 text-green-300 border border-green-800"
                              : item.stockStatus === "Out of stock"
                              ? "bg-red-900/30 text-red-300 border border-red-800"
                              : "bg-yellow-900/30 text-yellow-300 border border-yellow-800"
                          }`}
                        >
                          {item.stockStatus || "In stock"}
                        </span>
                        {item.bestseller && (
                          <span className="px-2 py-1 bg-purple-900/30 text-purple-300 rounded-full text-xs w-fit border border-purple-800">
                            Bestseller
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-3 sm:p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/edit/${item._id}`)}
                          className="p-2 bg-blue-900/30 hover:bg-blue-800 rounded-md transition-colors border border-blue-800"
                          title="Edit"
                        >
                          <FaRegEdit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => removeProduct(item._id)}
                          className="p-2 bg-red-900/30 hover:bg-red-800 rounded-md transition-colors border border-red-800"
                          title="Delete"
                        >
                          <FaTrashAlt className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tablet Card View (sm to lg) */}
      <div className="hidden md:block lg:hidden">
        <div className="grid grid-cols-1 gap-4">
          {list.map((item) => {
            const imageUrl = getImageUrl(item);
            const isVideo = isVideoUrl(imageUrl);
            const discountPercentage =
              item.discount > 0
                ? Math.round(((item.price - item.discount) / item.price) * 100)
                : 0;

            return (
              <div
                key={item._id}
                className="bg-[#0E0505] rounded-lg p-4 border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-[#1A0E0E] flex-shrink-0">
                    {isVideo ? (
                      <div className="relative w-full h-full">
                        <video
                          src={imageUrl}
                          className="w-full h-full object-cover"
                          muted
                          autoPlay
                          loop
                          playsInline
                        />
                        <div className="absolute top-1 left-1 bg-black bg-opacity-50 px-1 rounded text-xs">
                          VID
                        </div>
                      </div>
                    ) : (
                      <img
                        src={imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/96";
                        }}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base sm:text-lg truncate">
                          {item.name}
                        </h3>
                        <p className="text-gray-400 text-sm mb-2">
                          {item.category}
                        </p>
                        <p className="text-gray-500 text-xs sm:text-sm truncate">
                          {item.description?.substring(0, 80) ||
                            "No description"}
                          ...
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="text-right">
                          <span className="text-lg sm:text-xl font-bold">
                            {currency}
                            {item.discount || item.price}
                          </span>
                          {item.discount > 0 && (
                            <div className="flex items-center gap-1">
                              <span className="line-through text-gray-500 text-sm">
                                {currency}
                                {item.price}
                              </span>
                              <span className="text-green-400 text-xs font-bold">
                                {discountPercentage}% OFF
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              item.stockStatus === "In stock"
                                ? "bg-green-900/30 text-green-300"
                                : item.stockStatus === "Out of stock"
                                ? "bg-red-900/30 text-red-300"
                                : "bg-yellow-900/30 text-yellow-300"
                            }`}
                          >
                            {item.stockStatus || "In stock"}
                          </span>
                          {item.bestseller && (
                            <span className="px-2 py-1 bg-purple-900/30 text-purple-300 rounded-full text-xs">
                              Bestseller
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => navigate(`/edit/${item._id}`)}
                        className="flex-1 py-2 bg-blue-900/30 hover:bg-blue-800 rounded-md flex items-center justify-center gap-2 text-sm"
                      >
                        <FaRegEdit className="w-4 h-4" />
                        Edit
                      </button>

                      <button
                        onClick={() => removeProduct(item._id)}
                        className="flex-1 py-2 bg-red-900/30 hover:bg-red-800 rounded-md flex items-center justify-center gap-2 text-sm"
                      >
                        <FaTrashAlt className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Card View (xs to sm) */}
      <div className="md:hidden space-y-3">
        {list.map((item) => {
          const imageUrl = getImageUrl(item);
          const isVideo = isVideoUrl(imageUrl);
          const discountPercentage =
            item.discount > 0
              ? Math.round(((item.price - item.discount) / item.price) * 100)
              : 0;

          return (
            <div
              key={item._id}
              className="bg-[#0E0505] rounded-lg p-3 border border-gray-800"
            >
              <div className="flex gap-3">
                {/* Image */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#1A0E0E] flex-shrink-0">
                  {isVideo ? (
                    <div className="relative w-full h-full">
                      <video
                        src={imageUrl}
                        className="w-full h-full object-cover"
                        muted
                        autoPlay
                        loop
                        playsInline
                      />
                      <div className="absolute top-0 left-0 bg-black bg-opacity-50 px-1 rounded text-[10px]">
                        VID
                      </div>
                    </div>
                  ) : (
                    <img
                      src={imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/64";
                      }}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="font-bold text-sm truncate">
                        {item.name}
                      </h3>
                      <p className="text-gray-400 text-xs">{item.category}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-bold">
                        {currency}
                        {item.discount || item.price}
                      </span>
                      {item.discount > 0 && (
                        <span className="text-green-400 text-[10px] font-bold">
                          {discountPercentage}% OFF
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mt-1 mb-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] ${
                        item.stockStatus === "In stock"
                          ? "bg-green-900/30 text-green-300"
                          : item.stockStatus === "Out of stock"
                          ? "bg-red-900/30 text-red-300"
                          : "bg-yellow-900/30 text-yellow-300"
                      }`}
                    >
                      {item.stockStatus || "In stock"}
                    </span>
                    {item.bestseller && (
                      <span className="px-2 py-0.5 bg-purple-900/30 text-purple-300 rounded-full text-[10px]">
                        Bestseller
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/edit/${item._id}`)}
                      className="flex-1 py-1.5 bg-blue-900/30 hover:bg-blue-800 rounded-md flex items-center justify-center gap-1 text-xs"
                    >
                      <FaRegEdit className="w-3 h-3" />
                      Edit
                    </button>

                    <button
                      onClick={() => removeProduct(item._id)}
                      className="flex-1 py-1.5 bg-red-900/30 hover:bg-red-800 rounded-md flex items-center justify-center gap-1 text-xs"
                    >
                      <FaTrashAlt className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* No products message */}
      {!loading && list.length === 0 && (
        <div className="text-center py-12 bg-[#0E0505] rounded-lg border border-gray-800">
          <div className="text-4xl mb-4">📦</div>
          <p className="text-gray-400 text-lg mb-2">No products found</p>
          <p className="text-gray-500 text-sm mb-6">
            Get started by adding your first product
          </p>
          <button
            onClick={() => navigate("/add")}
            className="px-6 py-3 bg-green-900 hover:bg-green-800 rounded-md flex items-center gap-2 mx-auto"
          >
            <FaPlus />
            Add Your First Product
          </button>
        </div>
      )}

      {/* Total count */}
      {list.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-800 text-center sm:text-right">
          <p className="text-gray-400 text-sm">
            Showing{" "}
            <span className="text-white font-medium">{list.length}</span>{" "}
            product{list.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
};

export default List;
