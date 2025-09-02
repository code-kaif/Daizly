import React, { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Add = ({ token }) => {
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);

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
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("discount", discount);
      formData.append("category", category);
      formData.append("stockStatus", stockStatus);
      formData.append("bestseller", bestseller);
      formData.append("sizes", JSON.stringify(sizes));

      image1 && formData.append("image1", image1);
      image2 && formData.append("image2", image2);
      image3 && formData.append("image3", image3);
      image4 && formData.append("image4", image4);

      const response = await axios.post(
        backendUrl + "/api/product/add",
        formData,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Product Added");
        setName("");
        setDescription("");
        setImage1(false);
        setImage2(false);
        setImage3(false);
        setImage4(false);
        setPrice("");
        setDiscount("");
        setSizes([]);
        setBestseller(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
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
      }
    };
    fetchCategories();
  }, []);

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col w-full items-start gap-6 bg-[#0E0505] text-white rounded-lg"
    >
      {/* Image Upload */}
      <div className="w-full">
        <p className="mb-2">Upload Image</p>
        <div className="grid grid-cols-2 sm:flex sm:flex-row gap-3">
          {[image1, image2, image3, image4].map((img, index) => (
            <label
              key={index}
              htmlFor={`image${index + 1}`}
              className="w-full sm:w-20 h-24 sm:h-20 border border-gray-700 rounded-md flex items-center justify-center cursor-pointer bg-[#1A0E0E] hover:border-gray-500 transition"
            >
              {img ? (
                img.type.startsWith("video/") ? (
                  <video
                    src={URL.createObjectURL(img)}
                    className="w-full h-full object-cover rounded-md"
                    controls
                  />
                ) : (
                  <img
                    className="w-full h-full object-cover rounded-md"
                    src={URL.createObjectURL(img)}
                    alt="preview"
                  />
                )
              ) : (
                <Upload className="text-gray-400 w-6 h-6" />
              )}

              <input
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (index === 0) setImage1(file);
                  if (index === 1) setImage2(file);
                  if (index === 2) setImage3(file);
                  if (index === 3) setImage4(file);
                }}
                type="file"
                accept="image/*,video/*" // ✅ allow images & videos
                id={`image${index + 1}`}
                hidden
              />
            </label>
          ))}
        </div>
      </div>

      {/* Name */}
      <div className="w-full">
        <p className="mb-2">Product name</p>
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          className="w-full bg-[#1A0E0E] border border-gray-700 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-white placeholder-gray-500"
          type="text"
          placeholder="Type here"
          required
        />
      </div>

      {/* Description */}
      <div className="w-full">
        <p className="mb-2">Product description</p>
        <textarea
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          className="w-full bg-[#1A0E0E] border border-gray-700 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-white placeholder-gray-500"
          placeholder="Write content here"
          rows={4}
          required
        />
      </div>

      {/* Price & Discount */}
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <div className="flex-1">
          <p className="mb-2">Product Price</p>
          <input
            onChange={(e) => setPrice(e.target.value)}
            value={price}
            className="w-full bg-[#1A0E0E] border border-gray-700 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-white placeholder-gray-500"
            type="number"
            placeholder="99"
          />
        </div>
        <div className="flex-1">
          <p className="mb-2">Discount Price</p>
          <input
            onChange={(e) => setDiscount(e.target.value)}
            value={discount}
            className="w-full bg-[#1A0E0E] border border-gray-700 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-white placeholder-gray-500"
            type="number"
            placeholder="69"
          />
        </div>
      </div>

      {/* Category Section */}
      <div className="w-full">
        <p className="mb-2">Product category</p>
        <div className="flex items-center gap-3">
          <select
            onChange={(e) => setCategory(e.target.value)}
            value={category}
            className="bg-[#1A0E0E] w-full border border-gray-700 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-white"
          >
            <option value="default">Choose category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        {/* ✅ Add and Manage Category buttons */}
        <div className="flex items-center mt-3">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-3 py-2 bg-green-900 hover:bg-green-950 duration-200 rounded-md text-sm"
          >
            + Add Category
          </button>
          <button
            onClick={() => setShowManageModal(true)}
            className="px-3 py-2 bg-blue-900 hover:bg-blue-950 rounded-md ml-2"
          >
            Manage Categories
          </button>
        </div>
      </div>

      {/* ✅ Category Modal */}
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
                />
              </label>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-2 bg-gray-800 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                className="px-3 py-2 bg-green-900 hover:bg-green-950 rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Manage Categories Modal */}
      {showManageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1A0E0E] p-6 rounded-lg w-96 max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg mb-4">Manage Categories</h2>

            {/* Categories List */}
            {categories.length > 0 ? (
              <ul className="space-y-3">
                {categories.map((cat) => (
                  <li
                    key={cat._id}
                    className="flex items-center justify-between bg-[#0E0505] px-3 py-2 rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      {cat.image && (
                        <img
                          src={cat.image} // ✅ Fixed here
                          alt={cat.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      )}
                      <span>{cat.name}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(cat._id)}
                      className="px-2 py-1 bg-red-800 hover:bg-red-900 rounded-md text-sm"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No categories available.</p>
            )}

            {/* Close Button */}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowManageModal(false)}
                className="px-3 py-2 bg-gray-800 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sizes */}
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
            >
              <p
                className={`px-3 py-1 cursor-pointer rounded-md ${
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

      {/* Stock Status */}
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

      {/* Bestseller */}
      <div className="flex gap-2 mt-2 items-center">
        <input
          onChange={() => setBestseller((prev) => !prev)}
          checked={bestseller}
          type="checkbox"
          id="bestseller"
          className="accent-gray-600"
        />
        <label className="cursor-pointer text-gray-300" htmlFor="bestseller">
          Add to bestseller
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full sm:w-32 py-3 mt-4 bg-[#005530] hover:bg-green-800 text-white rounded-md flex items-center justify-center"
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
          "ADD"
        )}
      </button>
    </form>
  );
};

export default Add;
