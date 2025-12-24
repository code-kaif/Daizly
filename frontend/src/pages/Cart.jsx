import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import CartTotal from "../components/CartTotal";
import { FaTrash } from "react-icons/fa";

const Cart = () => {
  const { token, products, currency, cartItems, updateQuantity, navigate } =
    useContext(ShopContext);

  const [cartData, setCartData] = useState([]);

  // Helper to get image URL from either old or new schema
  const getImageUrl = (product) => {
    if (!product) return assets.placeholder_image;

    // New schema: images array of objects
    if (
      product.images &&
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      const firstImage = product.images[0];
      if (firstImage && typeof firstImage === "object" && firstImage.url) {
        return firstImage.url;
      }
      if (typeof firstImage === "string") {
        return firstImage;
      }
    }

    // Old schema: image array of strings
    if (
      product.image &&
      Array.isArray(product.image) &&
      product.image.length > 0
    ) {
      return product.image[0];
    }

    // Fallback to placeholder
    return assets.placeholder_image;
  };

  // Add fbq tracking when quantity changes
  const handleQuantityChange = (id, size, qty, product) => {
    updateQuantity(id, size, qty);

    if (window.fbq && product) {
      window.fbq("track", "AddToCart", {
        content_ids: [product._id],
        content_type: "product",
        value: product.discount * qty,
        currency: "INR",
      });
    }
  };

  useEffect(() => {
    if (products.length > 0) {
      const tempData = [];
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            tempData.push({
              _id: items,
              size: item,
              quantity: cartItems[items][item],
            });
          }
        }
      }
      setCartData(tempData);
    }
  }, [cartItems, products]);

  return (
    <div className="border-t pt-14">
      <div className="text-2xl mb-3">
        <Title text1={"YOUR"} text2={"CART"} />
      </div>

      {cartData.length === 0 ? (
        <div className="text-center py-32 text-gray-200">
          <p className="text-xl mb-6">Cart is empty. Go for shopping!</p>
          <button
            onClick={() => navigate("/collection")}
            className="px-6 py-3 text-white text-sm bg-[#005530] hover:bg-green-800 transition rounded"
          >
            Shop Now
          </button>
        </div>
      ) : (
        <>
          <div>
            {cartData.map((item, index) => {
              const productData = products.find(
                (product) => product._id === item._id
              );

              // ⚠️ Safely skip invalid products
              if (!productData) {
                console.warn("Product not found for cart item _id:", item._id);
                return null;
              }

              const imageUrl = getImageUrl(productData);

              return (
                <div
                  key={index}
                  className="py-4 border-t border-b text-gray-200 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4"
                >
                  <div className="flex items-start gap-6">
                    <img
                      className="w-16 sm:w-20 object-cover rounded"
                      src={imageUrl}
                      alt={productData.name || "Product"}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = assets.placeholder_image;
                      }}
                    />
                    <div>
                      <p className="text-xs sm:text-lg font-medium">
                        {productData.name}
                      </p>
                      <div className="flex items-center gap-5 mt-2">
                        <p>
                          {currency}
                          {productData.discount}
                        </p>
                        <p className="px-2 sm:px-3 sm:py-1 border bg-gray-900">
                          {item.size}
                        </p>
                      </div>
                    </div>
                  </div>
                  <input
                    onChange={(e) =>
                      e.target.value === "" || e.target.value === "0"
                        ? null
                        : handleQuantityChange(
                            item._id,
                            item.size,
                            Number(e.target.value),
                            productData
                          )
                    }
                    className="border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1 bg-gray-900"
                    type="number"
                    min={1}
                    defaultValue={item.quantity}
                  />
                  <FaTrash
                    onClick={() => updateQuantity(item._id, item.size, 0)}
                    className="text-red-500 cursor-pointer w-4 h-4 sm:w-5 sm:h-5 mr-4 hover:text-red-700 transition-colors duration-200"
                  />
                </div>
              );
            })}
          </div>

          <div className="flex justify-end my-10">
            <div className="w-full sm:w-[450px]">
              <CartTotal />
              <div className="w-full text-end">
                <button
                  onClick={() => {
                    if (!token) {
                      // Redirect to checkout where signup form will be shown
                      navigate("/place-order");
                    } else {
                      navigate("/place-order");
                    }
                  }}
                  className="bg-[#005530] hover:bg-green-800 text-white rounded-md text-sm my-8 px-8 py-3 font-medium"
                >
                  PROCEED TO CHECKOUT
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
