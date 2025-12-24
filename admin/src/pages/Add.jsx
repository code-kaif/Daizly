import React, { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Add = ({ token }) => {
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);
  const [image4, setImage4] = useState(null);
  const [image5, setImage5] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [category, setCategory] = useState("Choose Category");
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stockStatus, setStockStatus] = useState("In stock");

  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [categoryImage, setCategoryImage] = useState(null);
  const [showManageModal, setShowManageModal] = useState(false);

  // ✅ ADDED: isVideoFile helper function
  const isVideoFile = (fileName) => {
    if (!fileName) return false;
    const videoExtensions = [
      ".mp4",
      ".mov",
      ".webm",
      ".ogg",
      ".avi",
      ".wmv",
      ".flv",
      ".mkv",
    ];
    const lowerFileName = fileName.toLowerCase();
    return (
      videoExtensions.some((ext) => lowerFileName.endsWith(ext)) ||
      lowerFileName.includes("video/") ||
      lowerFileName.includes("video=true")
    );
  };

  // ✅ UPDATED: Enhanced video preview rendering
  const renderImagePreview = (img, index) => {
    if (!img) {
      return <Upload className="text-gray-400 w-6 h-6" />;
    }

    // If it's a File object (new upload)
    if (img instanceof File) {
      const isVideo = img.type.startsWith("video/") || isVideoFile(img.name);
      if (isVideo) {
        return (
          <div className="relative w-full h-full">
            <video
              src={URL.createObjectURL(img)}
              className="w-full h-full object-cover rounded-md"
              muted
              playsInline
              preload="metadata"
            />
            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
              VID
            </div>
          </div>
        );
      } else {
        return (
          <img
            className="w-full h-full object-cover rounded-md"
            src={URL.createObjectURL(img)}
            alt={`preview-${index + 1}`}
          />
        );
      }
    }

    // If it's an object (from existing product - should have url property)
    if (typeof img === "object" && img.url) {
      const isVideo = isVideoFile(img.url);
      if (isVideo) {
        return (
          <div className="relative w-full h-full">
            <video
              src={img.url}
              className="w-full h-full object-cover rounded-md"
              muted
              playsInline
              preload="metadata"
            />
            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
              VID
            </div>
          </div>
        );
      } else {
        return (
          <img
            className="w-full h-full object-cover rounded-md"
            src={img.url}
            alt={`preview-${index + 1}`}
          />
        );
      }
    }

    // If it's a string (fallback for old data during migration)
    if (typeof img === "string") {
      const isVideo = isVideoFile(img);
      if (isVideo) {
        return (
          <div className="relative w-full h-full">
            <video
              src={img}
              className="w-full h-full object-cover rounded-md"
              muted
              playsInline
              preload="metadata"
            />
            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
              VID
            </div>
          </div>
        );
      } else {
        return (
          <img
            className="w-full h-full object-cover rounded-md"
            src={img}
            alt={`preview-${index + 1}`}
          />
        );
      }
    }

    return <Upload className="text-gray-400 w-6 h-6" />;
  };

  // ✅ UPDATED: handleImageChange with better video support
  const handleImageChange = (file, index) => {
    if (!file) return;

    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/quicktime",
      "video/x-msvideo",
      "video/x-ms-wmv",
      "video/x-flv",
      "video/x-matroska",
    ];

    const isVideo = isVideoFile(file.name);

    if (!validTypes.includes(file.type) && !isVideo) {
      toast.error(
        `Invalid file type for image${index + 1}. Please use images or videos.`
      );
      return;
    }

    // Validate file size
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(
        `File too large for image${index + 1}. Max size is ${
          isVideo ? "50MB" : "10MB"
        }.`
      );
      return;
    }

    switch (index) {
      case 0:
        setImage1(file);
        break;
      case 1:
        setImage2(file);
        break;
      case 2:
        setImage3(file);
        break;
      case 3:
        setImage4(file);
        break;
      case 4:
        setImage5(file);
        break;
      default:
        break;
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return toast.error("Category name required");

    try {
      const formData = new FormData();
      formData.append("name", newCategory);
      if (categoryImage) formData.append("image", categoryImage);

      const res = await axios.post(backendUrl + "/api/category/add", formData, {
        headers: { token, "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        setCategories([...categories, res.data.category]);
        setCategory(res.data.category.name);
        setNewCategory("");
        setCategoryImage(null);
        setShowModal(false);
        toast.success("Category added");
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      const res = await axios.delete(
        backendUrl + "/api/category/delete/" + id,
        { headers: { token } }
      );

      if (res.data.success) {
        setCategories(categories.filter((c) => c._id !== id));
        toast.success("Category deleted");
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete");
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!name || !description || !price || !category) {
      return toast.error("Please fill all required fields");
    }

    // Check if at least one image is uploaded
    if (!image1 && !image2 && !image3 && !image4 && !image5) {
      return toast.error("Please upload at least one image");
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("discount", discount || 0); // Default to 0 if empty
      formData.append("category", category);
      formData.append("stockStatus", stockStatus);
      formData.append("bestseller", bestseller);
      formData.append("sizes", JSON.stringify(sizes));

      // Append image files if they exist
      if (image1 && image1 instanceof File) formData.append("image1", image1);
      if (image2 && image2 instanceof File) formData.append("image2", image2);
      if (image3 && image3 instanceof File) formData.append("image3", image3);
      if (image4 && image4 instanceof File) formData.append("image4", image4);
      if (image5 && image5 instanceof File) formData.append("image5", image5);

      const response = await axios.post(
        backendUrl + "/api/product/add",
        formData,
        {
          headers: {
            token,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("Product Added Successfully!");

        // Reset form
        setName("");
        setDescription("");
        setImage1(null);
        setImage2(null);
        setImage3(null);
        setImage4(null);
        setImage5(null);
        setPrice("");
        setDiscount("");
        setSizes([]);
        setBestseller(false);
        setStockStatus("In stock");

        // Optional: Navigate to product list or show success message
      } else {
        toast.error(response.data.message || "Failed to add product");
      }
    } catch (error) {
      console.error("Add product error:", error);
      toast.error(
        error.response?.data?.message || error.message || "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(backendUrl + "/api/category/list");
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      } catch (error) {
        console.log(error);
        toast.error("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col w-full items-start gap-6 bg-[#0E0505] text-white rounded-lg"
    >
      {/* Image Upload Section */}
      <div className="w-full">
        <p className="mb-2 text-lg font-semibold">Upload Product Images</p>
        <p className="mb-4 text-sm text-gray-400">
          Upload at least one image (JPG, PNG, WebP, GIF) or video (MP4, MOV,
          WebM, OGG, AVI, WMV)
          <br />
          Max size: 10MB for images, 50MB for videos
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {[image1, image2, image3, image4, image5].map((img, index) => (
            <div key={index} className="relative">
              <label
                htmlFor={`image${index + 1}`}
                className="block w-full h-40 border-2 border-dashed border-gray-700 rounded-lg flex items-center justify-center cursor-pointer bg-[#1A0E0E] hover:border-gray-500 transition-colors duration-200"
              >
                {renderImagePreview(img, index)}

                <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 rounded-full p-1">
                  <span className="text-xs px-2 py-1">{index + 1}</span>
                </div>
              </label>

              <input
                onChange={(e) => handleImageChange(e.target.files[0], index)}
                type="file"
                accept="image/*,video/*,.mov,.avi,.wmv,.flv,.mkv"
                id={`image${index + 1}`}
                className="hidden"
              />

              {/* Remove button for uploaded images */}
              {img && (
                <button
                  type="button"
                  onClick={() => {
                    switch (index) {
                      case 0:
                        setImage1(null);
                        break;
                      case 1:
                        setImage2(null);
                        break;
                      case 2:
                        setImage3(null);
                        break;
                      case 3:
                        setImage4(null);
                        break;
                      case 4:
                        setImage5(null);
                        break;
                      default:
                        break;
                    }
                  }}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Product Name */}
      <div className="w-full">
        <label className="block mb-2 text-lg font-semibold">
          Product Name <span className="text-red-500">*</span>
        </label>
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          className="w-full bg-[#1A0E0E] border border-gray-700 px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-white placeholder-gray-500"
          type="text"
          placeholder="Enter product name"
          required
        />
      </div>

      {/* Product Description */}
      <div className="w-full">
        <label className="block mb-2 text-lg font-semibold">
          Product Description <span className="text-red-500">*</span>
        </label>
        <textarea
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          className="w-full bg-[#1A0E0E] border border-gray-700 px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-white placeholder-gray-500"
          placeholder="Describe your product in detail"
          rows={4}
          required
        />
      </div>

      {/* Price & Discount */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div>
          <label className="block mb-2 text-lg font-semibold">
            Price <span className="text-red-500">*</span>
          </label>
          <input
            onChange={(e) => setPrice(e.target.value)}
            value={price}
            className="w-full bg-[#1A0E0E] border border-gray-700 px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-white"
            type="number"
            min="0"
            step="0.01"
            placeholder="99.99"
            required
          />
        </div>

        <div>
          <label className="block mb-2 text-lg font-semibold">
            Discount Price
          </label>
          <input
            onChange={(e) => setDiscount(e.target.value)}
            value={discount}
            className="w-full bg-[#1A0E0E] border border-gray-700 px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-white"
            type="number"
            min="0"
            step="0.01"
            placeholder="69.99"
          />
        </div>
      </div>

      {/* Category Section */}
      <div className="w-full">
        <label className="block mb-2 text-lg font-semibold">
          Category <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            onChange={(e) => setCategory(e.target.value)}
            value={category}
            className="flex-1 bg-[#1A0E0E] border border-gray-700 px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-white"
            required
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="px-4 py-3 bg-green-900 hover:bg-green-800 duration-200 rounded-md font-medium"
            >
              + Add Category
            </button>
            <button
              type="button"
              onClick={() => setShowManageModal(true)}
              className="px-4 py-3 bg-blue-900 hover:bg-blue-800 duration-200 rounded-md font-medium"
            >
              Manage Categories
            </button>
          </div>
        </div>
      </div>

      {/* Add Category Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1A0E0E] p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Add New Category</h2>

            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter category name"
              className="w-full bg-[#0E0505] border border-gray-700 px-4 py-3 rounded-md text-white mb-4"
              required
            />

            <div className="mb-4">
              <p className="mb-2">Category Image (Optional)</p>
              <label
                htmlFor="categoryImage"
                className="block w-full h-32 border-2 border-dashed border-gray-700 rounded-md flex items-center justify-center cursor-pointer bg-[#1A0E0E] hover:border-gray-500 transition"
              >
                {categoryImage ? (
                  <img
                    src={URL.createObjectURL(categoryImage)}
                    alt="preview"
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <div className="text-center">
                    <Upload className="text-gray-400 w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Upload image</p>
                  </div>
                )}
                <input
                  type="file"
                  id="categoryImage"
                  hidden
                  onChange={(e) => setCategoryImage(e.target.files[0])}
                  accept="image/*"
                />
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setNewCategory("");
                  setCategoryImage(null);
                }}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddCategory}
                className="px-4 py-2 bg-green-900 hover:bg-green-800 rounded-md"
                disabled={!newCategory.trim()}
              >
                Save Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Categories Modal */}
      {showManageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1A0E0E] p-6 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Manage Categories</h2>

            {categories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categories.map((cat) => (
                  <div
                    key={cat._id}
                    className="flex items-center justify-between bg-[#0E0505] p-4 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {cat.image && (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="font-medium">{cat.name}</p>
                        <p className="text-sm text-gray-400">
                          ID: {cat._id?.slice(-6)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(cat._id)}
                      className="px-3 py-1 bg-red-800 hover:bg-red-700 rounded-md text-sm"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">
                No categories available.
              </p>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowManageModal(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Sizes */}
      <div className="w-full">
        <label className="block mb-2 text-lg font-semibold">
          Available Sizes
        </label>
        <div className="flex flex-wrap gap-3">
          {["S", "M", "L", "XL", "XXL"].map((size) => (
            <button
              type="button"
              key={size}
              onClick={() =>
                setSizes((prev) =>
                  prev.includes(size)
                    ? prev.filter((item) => item !== size)
                    : [...prev, size]
                )
              }
              className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                sizes.includes(size)
                  ? "bg-gray-600 text-white"
                  : "bg-[#1A0E0E] border border-gray-700 text-gray-300 hover:border-gray-500"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Status */}
      <div className="w-full">
        <label className="block mb-2 text-lg font-semibold">Stock Status</label>
        <div className="flex flex-wrap gap-3">
          {["In stock", "Out of stock", "Coming soon"].map((status) => (
            <button
              type="button"
              key={status}
              onClick={() => setStockStatus(status)}
              className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                stockStatus === status
                  ? "bg-green-700 text-white"
                  : "bg-[#1A0E0E] border border-gray-700 text-gray-400 hover:border-gray-500"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Bestseller Toggle */}
      <div className="flex items-center gap-3 p-4 bg-[#1A0E0E] rounded-lg w-full">
        <input
          onChange={() => setBestseller((prev) => !prev)}
          checked={bestseller}
          type="checkbox"
          id="bestseller"
          className="w-5 h-5 accent-green-600"
        />
        <label htmlFor="bestseller" className="cursor-pointer text-lg">
          Mark as Bestseller
        </label>
        <span className="ml-auto text-sm text-gray-400 bg-gray-800 px-2 py-1 rounded">
          Featured product
        </span>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-4 mt-4 bg-green-900 hover:bg-green-800 text-white rounded-md font-bold text-lg flex items-center justify-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-5 w-5 mr-3 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Adding Product...
          </>
        ) : (
          "ADD PRODUCT"
        )}
      </button>
    </form>
  );
};

export default Add;
