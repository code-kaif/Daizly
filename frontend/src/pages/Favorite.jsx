import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import ProductItem from "../components/ProductItem";
import Title from "../components/Title";

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const { currency, backendUrl } = useContext(ShopContext);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/product/favorites`);
        if (res.data.success) {
          setFavorites(res.data.products);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchFavorites();
  }, []);

  return (
    <div>
      <div className="text-2xl md:py-5 py-10 border-t">
        <Title text1={"My"} text2={"Favorite"} />
      </div>

      {favorites.length === 0 ? (
        <p className="text-gray-400">No favorite products yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map((product) => (
            <ProductItem
              key={product._id}
              id={product._id}
              image={product.image}
              name={product.name}
              discount={product.discount}
              stockStatus={product.stockStatus}
              currency={currency}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
