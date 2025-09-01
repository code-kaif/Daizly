import axios from "axios";
import React, { useEffect, useState } from "react";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FaRegEdit } from "react-icons/fa";

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const navigate = useNavigate();

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
      console.log(error);
      toast.error(error.message);
    }
  };

  // Remove product
  const removeProduct = async (id) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/product/remove",
        { id },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList(); // refresh list after delete
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div>
      <p className="mb-2">All Products List</p>
      <div className="flex flex-col gap-2">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center py-1 px-2 border text-sm">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Discount Price</b>
          <b className="text-center">Edit</b>
          <b className="text-center">Delete</b>
        </div>

        {/* Product List */}
        {list.map((item, index) => (
          <div
            className="grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm"
            key={index}
          >
            {item.image[0]?.match(/\.(mp4|webm|ogg)$/i) ? (
              <video
                src={item.image[0]}
                className="w-12 h-12 object-cover rounded"
                muted
                autoPlay
                loop
              />
            ) : (
              <img
                src={item.image[0]}
                alt={item.name}
                className="w-12 h-12 object-cover rounded"
              />
            )}

            <p>{item.name}</p>
            <p>{item.category}</p>
            <p>
              {currency}
              {item.discount}
            </p>

            {/* Edit Button */}
            <p
              onClick={() => navigate(`/edit/${item._id}`)}
              className="text-center cursor-pointer text-lg"
            >
              🖊️
            </p>

            {/* Delete Button */}
            <p
              onClick={() => removeProduct(item._id)}
              className="text-center cursor-pointer text-lg"
            >
              ❌
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default List;
