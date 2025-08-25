import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import { toast } from "react-toastify";

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart } = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");

  const fetchProductData = async () => {
    products.forEach((item) => {
      if (item._id === productId) {
        setProductData(item);
        setImage(item.image[0]);
      }
    });
  };

  useEffect(() => {
    fetchProductData();
  }, [productId, products]);

  const handleAddToCart = () => {
    if (!size) {
      toast.info("Please select a size.");
      return;
    }
    addToCart(productData._id, size);
    toast.success("Added to cart");
  };

  return productData ? (
    <div className="border-t-2 pt-12 transition-opacity ease-in duration-500 opacity-100">
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1 flex flex-col-reverse gap-4 lg:flex-row">
          <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:w-[18%] w-full">
            {productData.image.map((item, index) => (
              <img
                onClick={() => setImage(item)}
                src={item}
                key={index}
                className={`w-24 h-24 object-cover rounded-lg cursor-pointer border ${
                  image === item ? "border-gray-800" : "border-gray-200"
                } transition duration-200 hover:scale-105`}
                alt=""
              />
            ))}
          </div>

          {/* Main Image */}
          <div className="w-full lg:w-[75%]">
            <img
              className="w-full rounded-lg shadow-md transition-transform duration-300 hover:scale-[1.02]"
              src={image}
              alt=""
            />
          </div>
        </div>

        {/* ---------- Product Info ---------- */}
        <div className="flex-1">
          <h1 className="font-semibold text-3xl text-gray-200 mb-2">
            {productData.name}
          </h1>

          {/* Ratings */}
          <div className="flex items-center gap-1 mb-3">
            <img src={assets.star_icon} alt="" className="w-4" />
            <img src={assets.star_icon} alt="" className="w-4" />
            <img src={assets.star_icon} alt="" className="w-4" />
            <img src={assets.star_icon} alt="" className="w-4" />
            <img src={assets.star_dull_icon} alt="" className="w-4" />
            <p className="pl-2 text-gray-200 text-sm">(122 reviews)</p>
          </div>

          <div className="flex">
            <p className="text-3xl font-bold text-gray-200 mb-4 line-through mr-3">
              {currency}
              {productData.price}
            </p>

            <p className="text-3xl font-bold text-green-800 mb-4">
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
            <p className="font-medium text-gray-200">Select Size:</p>
            <div className="flex gap-2 flex-wrap">
              {productData.sizes.map((item, index) => (
                <button
                  onClick={() => setSize(item)}
                  className={`border py-2 px-5 rounded-lg transition ${
                    item === size
                      ? "border-gray-800 bg-gray-800 text-white"
                      : "border-gray-300 bg-gray-100 hover:bg-gray-200"
                  }`}
                  key={index}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* ✅ Add to Cart */}
          <button
            onClick={handleAddToCart}
            className="bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg px-8 py-3 my-4 text-sm shadow-md transition"
          >
            🛒 ADD TO CART
          </button>

          {/* ✅ Product Highlights */}
          <hr className="mt-6 sm:w-4/5" />
          <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
            <p>✔️ 100% Original product</p>
            <p>✔️ Cash on delivery available</p>
            <p>✔️ Easy return & exchange within 7 days</p>
          </div>
        </div>
      </div>
      {/* <RelatedProducts category={productData.category} /> */}
    </div>
  ) : (
    <div className="opacity-0"></div>
  );
};

export default Product;
