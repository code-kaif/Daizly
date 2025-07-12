import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Cancel = ({ token }) => {
  const [cancelledOrders, setCancelledOrders] = useState([]);

  const fetchCancelledOrders = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/order/cancelled`, {
        headers: { token },
      });
      if (response.data.success) {
        setCancelledOrders(response.data.orders); // Use API result directly (already filtered)
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      toast.error("Failed to load cancelled orders");
    }
  };

  useEffect(() => {
    fetchCancelledOrders();
  }, []);

  return (
    <div>
      <ToastContainer />
      <h2>Cancelled Orders</h2>

      {cancelledOrders.length === 0 ? (
        <p className="text-gray-500 my-3 md:my-4">No cancelled orders found.</p>
      ) : (
        <div className="space-y-6 my-3 md:my-4">
          {cancelledOrders.map((order, idx) => (
            <div
              key={idx}
              className="bg-white shadow-sm border border-red-300 p-6 rounded-md text-gray-700"
            >
              {/* Order Header */}
              <div className="mb-4 grid sm:grid-cols-2 gap-2 text-sm text-gray-700">
                <p>
                  <strong>Name:</strong>{" "}
                  {order.address.firstName + " " + order.address.lastName}
                </p>
                <p>
                  <strong>Mobile:</strong> {order.address.phone}
                </p>
                <p>
                  <strong>Date:</strong> {new Date(order.date).toDateString()}
                </p>
                <p>
                  <strong>Payment:</strong> {order.paymentMethod} (
                  {order.payment ? "Paid" : "Unpaid"})
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className="text-red-500 font-semibold">
                    {order.status}
                  </span>
                </p>
              </div>

              {/* Order Items */}
              <div className="divide-y">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-4"
                  >
                    <div className="flex items-start gap-4 text-sm w-full md:w-1/2">
                      <img
                        src={item.image[0]}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          ₹{item.price} | Quantity: {item.quantity} | Size:{" "}
                          {item.size}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Cancel;
