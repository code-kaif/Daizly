import React, { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import ProductItem from "./ProductItem";
import Title from "./Title";
import { assets } from "../assets/assets";

const CategorySection = () => {
  const { products } = useContext(ShopContext);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Category list with background images (replace these URLs with your own)
  const categories = [
    {
      name: "Jacket",
      image: assets.jacket,
    },
    {
      name: "Shirt",
      image: assets.shirt,
    },
    {
      name: "Hoodie",
      image: assets.hoodie,
    },
    {
      name: "Swetshirt",
      image: assets.swetshirt,
    },
  ].map((cat) => {
    const count = products.filter((p) => p.category === cat.name).length;
    return { ...cat, count };
  });

  return (
    <div className="w-full bg-[#0E0505] text-white py-20 px-6">
      {/* Categories Grid */}
      {!selectedCategory ? (
        <>
          <div className="text-3xl text-center py-10">
            <Title text1={"Shop by"} text2={"Category"} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {categories.map((cat, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedCategory(cat.name)}
                className="relative cursor-pointer rounded-2xl overflow-hidden group md:h-80 h-60"
              >
                {/* Background Image */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                />

                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center">
                  <h3 className="text-lg font-bold">{cat.name}</h3>
                  <p className="mt-1 text-gray-300 text-sm">
                    {cat.count} products
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Show products of selected category */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">
              {selectedCategory} Collection
            </h2>
            <button
              onClick={() => setSelectedCategory(null)}
              className="px-4 py-2 bg-gray-800 rounded-md text-sm hover:bg-gray-700 transition"
            >
              ← Back
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {products
              .filter((p) => p.category === selectedCategory)
              .map((item) => (
                <ProductItem
                  key={item.id}
                  id={item._id}
                  image={item.image}
                  name={item.name}
                  discount={item.discount}
                />
              ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CategorySection;
