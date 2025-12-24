import React, { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";

const EditProduct = ({ token }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State for image files (can be File objects or image objects from backend)
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
  const [fetching, setFetching] = useState(true);
  const [productNotFound, setProductNotFound] = useState(false);
  const [stockStatus, setStockStatus] = useState("In stock");

  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [categoryImage, setCategoryImage] = useState(null);

  // Check if file is a video (updated with mimeType check)
  const isVideoFile = (file) => {
    if (!file) return false;

    // If backend object
    if (typeof file === "object") {
      return file.mimeType?.startsWith("video/");
    }

    // If string URL fallback
    if (typeof file === "string") {
      return /\.(mp4|mov|webm|ogg|avi|mkv)$/i.test(file);
    }

    return false;
  };

  // 🔹 Fetch product details
  useEffect(() => {
    // Fix 1.1 – early guard when id is missing
    if (!id) {
      setProductNotFound(true);
      setFetching(false);
      toast.error("Product ID is required");
      return;
    }

    let isMounted = true; // Track if component is still mounted

    const fetchProduct = async () => {
      try {
        const res = await axios.post(`${backendUrl}/api/product/single`, {
          id,
        });

        // Don't update state if component unmounted
        if (!isMounted) return;

        // Fix 1.2 – check both success AND product exists
        if (res.data.success && res.data.product) {
          const p = res.data.product;
          setName(p.name || "");
          setDescription(p.description || "");
          setPrice(p.price || "");
          setDiscount(p.discount || "");
          setCategory(p.category || "Choose Category");
          setBestseller(p.bestseller || false);
          setStockStatus(p.stockStatus || "In stock");
          setSizes(p.sizes || []);

          // Handle images from backend (now an array of objects)
          if (p.images && Array.isArray(p.images)) {
            // New schema: images is array of objects with url property
            p.images.forEach((imgObj, index) => {
              if (imgObj && imgObj.url) {
                // Fix 2.2 – Use mimeType to detect video
                const imageObj = {
                  ...imgObj,
                  isVideo: imgObj.mimeType?.startsWith("video/"),
                };
                switch (index) {
                  case 0:
                    setImage1(imageObj);
                    break;
                  case 1:
                    setImage2(imageObj);
                    break;
                  case 2:
                    setImage3(imageObj);
                    break;
                  case 3:
                    setImage4(imageObj);
                    break;
                  case 4:
                    setImage5(imageObj);
                    break;
                  default:
                    break;
                }
              }
            });
          } else if (p.image && Array.isArray(p.image)) {
            // Fallback for old schema during migration: image is array of strings
            p.image.forEach((imgUrl, index) => {
              if (imgUrl) {
                const imgObj = {
                  url: imgUrl,
                  fileId: null,
                  isVideo: isVideoFile(imgUrl),
                };
                switch (index) {
                  case 0:
                    setImage1(imgObj);
                    break;
                  case 1:
                    setImage2(imgObj);
                    break;
                  case 2:
                    setImage3(imgObj);
                    break;
                  case 3:
                    setImage4(imgObj);
                    break;
                  case 4:
                    setImage5(imgObj);
                    break;
                  default:
                    break;
                }
              }
            });
          }
          setProductNotFound(false);
        } else {
          toast.error(res.data.message || "Product not found");
          setProductNotFound(true);
        }
      } catch (error) {
        console.error("Fetch product error:", error);
        // Don't update state if component unmounted
        if (!isMounted) return;

        // Check for specific error types
        if (error.response?.status === 404) {
          toast.error("Product not found (404)");
        } else if (error.response?.status === 400) {
          toast.error("Invalid product ID");
        } else {
          toast.error("Failed to load product details");
        }
        setProductNotFound(true);
      } finally {
        // Always set fetching to false, but check mount status
        if (isMounted) {
          setFetching(false);
        }
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await axios.get(backendUrl + "/api/category/list");
        if (res.data.success && isMounted) {
          setCategories(res.data.categories);
        }
      } catch (error) {
        console.error("Fetch categories error:", error);
        // Don't toast here as product fetch might have already shown an error
      }
    };

    fetchProduct();
    fetchCategories();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [id, navigate]);

  // 🔹 Update product
  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!name || !description || !price || !category) {
      return toast.error("Please fill all required fields");
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("discount", discount || 0);
      formData.append("category", category);
      formData.append("bestseller", bestseller);
      formData.append("stockStatus", stockStatus);
      formData.append("sizes", JSON.stringify(sizes));

      // Only append if new files are uploaded (File instances)
      // Existing images (objects) won't be sent unless replaced
      if (image1 instanceof File) formData.append("image1", image1);
      if (image2 instanceof File) formData.append("image2", image2);
      if (image3 instanceof File) formData.append("image3", image3);
      if (image4 instanceof File) formData.append("image4", image4);
      if (image5 instanceof File) formData.append("image5", image5);

      const response = await axios.put(
        `${backendUrl}/api/product/update/${id}`,
        formData,
        {
          headers: {
            token,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("Product updated successfully!");
        navigate("/list"); // Adjust path as needed
      } else {
        toast.error(response.data.message || "Failed to update product");
      }
    } catch (error) {
      console.error("Update product error:", error);
      toast.error(
        error.response?.data?.message || error.message || "Something went wrong"
      );
    } finally {
      setIsLoading(false);
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

  // ✅ Simplified renderImagePreview like File 2
  const renderImagePreview = (img, index) => {
    if (!img) {
      return <Upload className="text-gray-400 w-6 h-6" />;
    }

    // If it's a File object (new upload)
    if (img instanceof File) {
      const isVideo = img.type.startsWith("video/") || isVideoFile(img.name);
      if (isVideo) {
        return (
          <video
            src={URL.createObjectURL(img)}
            className="w-full h-full object-cover rounded-md"
            controls
          />
        );
      } else {
        return (
          <img
            src={URL.createObjectURL(img)}
            alt="preview"
            className="w-full h-full object-cover rounded-md"
          />
        );
      }
    }

    // If it's an object (from backend - should have url property)
    if (typeof img === "object" && img.url) {
      const isVideo = img.mimeType?.startsWith("video/") || img.isVideo;
      if (isVideo) {
        return (
          <video
            src={img.url}
            className="w-full h-full object-cover rounded-md"
            controls
          />
        );
      } else {
        return (
          <img
            src={img.url}
            alt="preview"
            className="w-full h-full object-cover rounded-md"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/96";
            }}
          />
        );
      }
    }

    // If it's a string (fallback)
    if (typeof img === "string") {
      const isVideo = isVideoFile(img);
      if (isVideo) {
        return (
          <video
            src={img}
            className="w-full h-full object-cover rounded-md"
            controls
          />
        );
      } else {
        return (
          <img
            src={img}
            alt="preview"
            className="w-full h-full object-cover rounded-md"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/96";
            }}
          />
        );
      }
    }

    return <Upload className="text-gray-400 w-6 h-6" />;
  };

  const handleImageChange = (file, index) => {
    if (!file) return;

    // Validate file type
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

    const fileExtension = file.name.toLowerCase().split(".").pop();
    const isVideo = isVideoFile(file.name);

    // Accept common video extensions even if MIME type is not standard
    if (!validTypes.includes(file.type) && !isVideo) {
      toast.error(
        `Invalid file type for image${index + 1}. Please use images or videos.`
      );
      return;
    }

    // Validate file size (max 50MB for videos, 10MB for images)
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

  // SIMPLIFIED LOADING LOGIC
  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0E0505]">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  // Show product not found ONLY if we're not fetching AND product is not found
  if (!fetching && productNotFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0E0505] text-white">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="mb-6">
          The product you're trying to edit doesn't exist or has been deleted.
        </p>
        <button
          onClick={() => navigate("/list")}
          className="px-6 py-3 bg-[#005530] hover:bg-green-800 rounded-md"
        >
          Back to Products
        </button>
      </div>
    );
  }

  // If we're not fetching and product was found, show the edit form
  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col w-full items-start gap-6 bg-[#0E0505] text-white rounded-lg"
    >
      {/* Image Upload - Simplified like File 2 */}
      <div className="w-full">
        <p className="mb-2">Upload Image</p>
        <div className="grid grid-cols-2 sm:flex sm:flex-row gap-3">
          {[image1, image2, image3, image4, image5].map((img, index) => (
            <label
              key={index}
              htmlFor={`image${index + 1}`}
              className="w-full sm:w-20 h-24 sm:h-20 border border-gray-700 rounded-md flex items-center justify-center cursor-pointer bg-[#1A0E0E] hover:border-gray-500 transition"
            >
              {renderImagePreview(img, index)}
              <input
                onChange={(e) => handleImageChange(e.target.files[0], index)}
                type="file"
                accept="image/*,video/*"
                id={`image${index + 1}`}
                hidden
              />
            </label>
          ))}
        </div>
      </div>

      {/* Name - Simplified like File 2 */}
      <div className="w-full">
        <p className="mb-2">Product name</p>
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          className="w-full bg-[#1A0E0E] border border-gray-700 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-white"
          type="text"
          required
        />
      </div>

      {/* Description - Simplified like File 2 */}
      <div className="w-full">
        <p className="mb-2">Product description</p>
        <textarea
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          className="w-full bg-[#1A0E0E] border border-gray-700 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-white"
          rows={4}
          required
        />
      </div>

      {/* Price & Discount - Simplified like File 2 */}
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <div className="flex-1">
          <p className="mb-2">Product Price</p>
          <input
            onChange={(e) => setPrice(e.target.value)}
            value={price}
            className="w-full bg-[#1A0E0E] border border-gray-700 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-white"
            type="number"
            required
          />
        </div>
        <div className="flex-1">
          <p className="mb-2">Discount Price</p>
          <input
            onChange={(e) => setDiscount(e.target.value)}
            value={discount}
            className="w-full bg-[#1A0E0E] border border-gray-700 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-white"
            type="number"
          />
        </div>
      </div>

      {/* Category Section - Simplified like File 2 */}
      <div className="w-full">
        <p className="mb-2">Product category</p>
        <div className="flex items-center gap-3">
          <select
            onChange={(e) => setCategory(e.target.value)}
            value={category}
            className="bg-[#1A0E0E] border border-gray-700 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-white flex-1"
            required
          >
            <option value="">Choose category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-3 py-2 bg-green-900 hover:bg-green-950 rounded-md text-sm"
          >
            + Add Category
          </button>
        </div>
      </div>

      {/* ✅ Category Modal - Simplified like File 2 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1A0E0E] p-6 rounded-lg w-80">
            <h2 className="text-lg mb-4">Add New Category</h2>

            {/* Category Name */}
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter category name"
              className="w-full bg-[#0E0505] border border-gray-700 px-3 py-2 rounded-md text-white mb-4"
              required
            />

            {/* ✅ Upload Image */}
            <div className="mb-4">
              <p className="mb-2 text-sm">Upload Category Image</p>
              <label
                htmlFor="categoryImage"
                className="w-full h-24 border border-gray-700 rounded-md flex items-center justify-center cursor-pointer bg-[#1A0E0E] hover:border-gray-500 transition"
              >
                {categoryImage ? (
                  <img
                    src={URL.createObjectURL(categoryImage)}
                    alt="preview"
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <Upload className="text-gray-400 w-6 h-6" />
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

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setNewCategory("");
                  setCategoryImage(null);
                }}
                className="px-3 py-2 bg-gray-800 rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddCategory}
                className="px-3 py-2 bg-green-900 hover:bg-green-950 rounded-md"
                disabled={!newCategory.trim()}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sizes - Simplified like File 2 */}
      <div className="w-full">
        <p className="mb-2">Product Sizes</p>
        <div className="flex gap-3 flex-wrap">
          {["S", "M", "L", "XL", "XXL"].map((size) => (
            <div
              key={size}
              onClick={() =>
                setSizes((prev) =>
                  prev.includes(size)
                    ? prev.filter((item) => item !== size)
                    : [...prev, size]
                )
              }
              className="cursor-pointer"
            >
              <p
                className={`px-3 py-1 rounded-md ${
                  sizes.includes(size)
                    ? "bg-gray-600 text-white"
                    : "bg-[#1A0E0E] border border-gray-700 text-gray-300"
                }`}
              >
                {size}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Stock Status - Simplified like File 2 */}
      <div className="w-full">
        <p className="mb-2">Stock Status</p>
        <div className="flex gap-3">
          {["In stock", "Out of stock", "Coming soon"].map((status) => (
            <button
              type="button"
              key={status}
              onClick={() => setStockStatus(status)}
              className={`px-4 py-2 rounded-md ${
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

      {/* Bestseller - Simplified like File 2 */}
      <div className="flex gap-2 mt-2 items-center">
        <input
          onChange={() => setBestseller((prev) => !prev)}
          checked={bestseller}
          type="checkbox"
          id="bestseller"
          className="accent-gray-600"
        />
        <label htmlFor="bestseller" className="cursor-pointer">
          Add to bestseller
        </label>
      </div>

      {/* Submit - Simplified like File 2 */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full sm:w-32 py-3 mt-4 bg-[#005530] hover:bg-green-800 rounded-md flex items-center justify-center"
      >
        {isLoading ? (
          <svg
            className="animate-spin h-5 w-5 text-white"
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
              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
            ></path>
          </svg>
        ) : (
          "UPDATE"
        )}
      </button>
    </form>
  );
};

export default EditProduct;
