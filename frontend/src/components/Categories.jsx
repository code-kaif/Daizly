import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import ProductItem from "./ProductItem";
import Title from "./Title";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CategorySection = () => {
  const { products, backendUrl } = useContext(ShopContext);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);

  // Responsive visibleCount
  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth < 640) setVisibleCount(1); // mobile
      else if (window.innerWidth < 768) setVisibleCount(2); // small
      else if (window.innerWidth < 1024) setVisibleCount(3); // tablet
      else setVisibleCount(4); // desktop
    };
    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/category/list`);
        const data = await res.json();
        if (data.success) {
          const updated = data.categories.map((cat) => {
            const count = products.filter(
              (p) => p.category === cat.name
            ).length;
            return { ...cat, count };
          });
          setCategories(updated);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, [products]);

  // Slice categories for carousel
  const visibleCategories = categories.slice(
    currentIndex,
    currentIndex + visibleCount
  );

  const canGoLeft = currentIndex > 0;
  const canGoRight = currentIndex + visibleCount < categories.length;

  return (
    <div className="w-full bg-black text-white py-20 px-4 sm:px-6">
      {!selectedCategory ? (
        <>
          <div className="text-3xl text-center py-8">
            <Title text1={"Shop by"} text2={"Category"} />
          </div>

          <div className="relative flex items-center justify-center">
            {/* Left Arrow */}
            {canGoLeft && (
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                className="absolute left-0 z-10 bg-gray-800 p-2 rounded-full hover:bg-gray-700 transition"
              >
                <ChevronLeft size={22} />
              </button>
            )}

            {/* Category Cards */}
            <div className="flex gap-4 sm:gap-6 overflow-hidden w-full justify-center">
              {visibleCategories.map((cat) => (
                <div
                  key={cat._id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className="relative cursor-pointer rounded-xl overflow-hidden group h-80 sm:h-60 md:h-80 lg:h-80 w-full max-w-[240px] flex-shrink-0"
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/240x320";
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center">
                    <h3 className="text-base sm:text-lg font-bold">
                      {cat.name}
                    </h3>
                    <p className="mt-1 text-gray-300 text-xs sm:text-sm">
                      {cat.count} products
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Arrow */}
            {canGoRight && (
              <button
                onClick={() =>
                  setCurrentIndex((prev) =>
                    Math.min(prev + 1, categories.length - visibleCount)
                  )
                }
                className="absolute right-0 z-10 bg-gray-800 p-2 rounded-full hover:bg-gray-700 transition"
              >
                <ChevronRight size={22} />
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold">
              {selectedCategory} Collection
            </h2>
            <button
              onClick={() => setSelectedCategory(null)}
              className="px-3 py-2 bg-gray-800 rounded-md text-sm hover:bg-gray-700 transition"
            >
              ← Back
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products
              .filter((p) => p.category === selectedCategory)
              .map((item) => (
                <ProductItem
                  key={item._id}
                  id={item._id}
                  // Pass both image props for backward compatibility
                  image={item.image} // Old schema: array of strings
                  images={item.images} // New schema: array of objects
                  name={item.name}
                  discount={item.discount}
                  stockStatus={item.stockStatus}
                />
              ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CategorySection;
