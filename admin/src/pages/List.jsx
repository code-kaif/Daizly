import axios from "axios";
import React, { useEffect, useState } from "react";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FaRegEdit } from "react-icons/fa";

const List = ({ token }) => {
  const [list, setList] = useState([]);
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
  if (list.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">All Products</h2>
        <button
          onClick={() => navigate("/add")}
          className="px-4 py-2 bg-green-900 hover:bg-green-800 rounded-md"
        >
          + Add New Product
        </button>
      </div>

      <div className="bg-[#1A0E0E] rounded-lg overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#0E0505] text-left text-gray-300">
                <th className="p-4">Image</th>
                <th className="p-4">Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item) => {
                const imageUrl = getImageUrl(item);
                const isVideo = isVideoUrl(imageUrl);

                return (
                  <tr
                    key={item._id}
                    className="border-b border-gray-800 hover:bg-[#0E0505] transition-colors"
                  >
                    <td className="p-4">
                      <div className="w-16 h-16 rounded overflow-hidden bg-[#0E0505] flex items-center justify-center">
                        {isVideo ? (
                          <div className="relative">
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
                    </td>

                    <td className="p-4">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-gray-400 truncate max-w-xs">
                          {item.description?.substring(0, 60)}...
                        </p>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="px-3 py-1 bg-gray-800 rounded-full text-sm">
                        {item.category}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-col">
                        <span
                          className={`${
                            item.discount
                              ? "line-through text-gray-400 text-sm"
                              : "text-lg"
                          }`}
                        >
                          {currency}
                          {item.price}
                        </span>
                        {item.discount > 0 && (
                          <span className="text-green-400 font-bold">
                            {currency}
                            {item.discount}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      {item.discount > 0 ? (
                        <span className="text-green-400 font-medium">
                          {Math.round(
                            ((item.price - item.discount) / item.price) * 100
                          )}
                          % OFF
                        </span>
                      ) : (
                        <span className="text-gray-500">No discount</span>
                      )}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          item.stockStatus === "In stock"
                            ? "bg-green-900 text-green-300"
                            : item.stockStatus === "Out of stock"
                            ? "bg-red-900 text-red-300"
                            : "bg-yellow-900 text-yellow-300"
                        }`}
                      >
                        {item.stockStatus || "In stock"}
                      </span>
                      {item.bestseller && (
                        <span className="ml-2 px-2 py-1 bg-purple-900 text-purple-300 rounded-full text-xs">
                          Bestseller
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/edit/${item._id}`)}
                          className="p-2 bg-blue-900 hover:bg-blue-800 rounded-md"
                          title="Edit"
                        >
                          <FaRegEdit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => removeProduct(item._id)}
                          className="p-2 bg-red-900 hover:bg-red-800 rounded-md"
                          title="Delete"
                        >
                          ❌
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4 p-4">
          {list.map((item) => {
            const imageUrl = getImageUrl(item);
            const isVideo = isVideoUrl(imageUrl);

            return (
              <div
                key={item._id}
                className="bg-[#0E0505] rounded-lg p-4 border border-gray-800"
              >
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded overflow-hidden bg-[#1A0E0E] flex-shrink-0">
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

                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                    <p className="text-gray-400 text-sm mb-2">
                      {item.category}
                    </p>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl font-bold">
                        {currency}
                        {item.discount || item.price}
                      </span>
                      {item.discount > 0 && (
                        <>
                          <span className="line-through text-gray-500">
                            {currency}
                            {item.price}
                          </span>
                          <span className="text-green-400 text-sm font-bold">
                            {Math.round(
                              ((item.price - item.discount) / item.price) * 100
                            )}
                            % OFF
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          item.stockStatus === "In stock"
                            ? "bg-green-900 text-green-300"
                            : item.stockStatus === "Out of stock"
                            ? "bg-red-900 text-red-300"
                            : "bg-yellow-900 text-yellow-300"
                        }`}
                      >
                        {item.stockStatus || "In stock"}
                      </span>
                      {item.bestseller && (
                        <span className="px-2 py-1 bg-purple-900 text-purple-300 rounded-full text-xs">
                          Bestseller
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/edit/${item._id}`)}
                        className="flex-1 py-2 bg-blue-900 hover:bg-blue-800 rounded-md flex items-center justify-center gap-2"
                      >
                        <FaRegEdit className="w-4 h-4" />
                        Edit
                      </button>

                      <button
                        onClick={() => removeProduct(item._id)}
                        className="flex-1 py-2 bg-red-900 hover:bg-red-800 rounded-md flex items-center justify-center gap-2"
                      >
                        ❌ Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* No products message */}
      {list.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg mb-4">No products found</p>
          <button
            onClick={() => navigate("/add")}
            className="px-6 py-3 bg-green-900 hover:bg-green-800 rounded-md"
          >
            Add Your First Product
          </button>
        </div>
      )}

      {/* Total count */}
      <div className="mt-6 text-right text-gray-400">
        Showing {list.length} product{list.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
};

export default List;
