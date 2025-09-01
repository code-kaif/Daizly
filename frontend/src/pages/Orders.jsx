import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);
  const [orderData, setorderData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // 📌 Load Orders
  const loadOrderData = async () => {
    try {
      if (!token) return;

      const response = await axios.post(
        backendUrl + "/api/order/userorders",
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        let allOrdersItem = [];
        response.data.orders.forEach((order) => {
          if (!(order.status === "Cancelled" && order.orderCancelled)) {
            order.items.forEach((item) => {
              item["_id"] = order._id;
              item["status"] = order.status;
              item["payment"] = order.payment;
              item["paymentMethod"] = order.paymentMethod;
              item["date"] = order.date;
              // Inside loadOrderData -> when pushing items:
              item["trackingSteps"] = order.trackingSteps || [];
              order["orderCancelled"] && (item["cancelled"] = true);
              allOrdersItem.push(item);
            });
          }
        });

        setorderData(allOrdersItem.reverse());

        // 🔹 Auto-fetch Shiprocket tracking for all orders
        const orderIds = response.data.orders.map((o) => o._id);
        fetchBulkTracking(orderIds);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  };

  const fetchBulkTracking = async (orderIds) => {
    try {
      const response = await axios.get(
        backendUrl + "/api/order/track-all",
        { orderIds },
        { headers: { token } }
      );

      if (response.data.success) {
        const tracking = response.data.tracking;

        setorderData((prev) =>
          prev.map((item) =>
            tracking[item._id]
              ? { ...item, trackingSteps: tracking[item._id] }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Bulk tracking error:", error);
    }
  };

  // 📌 Cancel Order
  const handleCancelOrder = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/cancel`,
        { orderId: selectedOrderId },
        { headers: { token } }
      );
      if (response.data.success) {
        setShowModal(false);
        loadOrderData();
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [token]);

  return (
    <div className="border-t min-h-[80vh] py-10">
      <div className="text-2xl mb-10">
        <Title text1={"MY"} text2={"ORDERS"} />
      </div>

      {orderData.length === 0 ? (
        <div className="text-center mt-20">
          <p className="text-lg font-semibold text-gray-200">
            You haven't any Order, Go for Shopping!
          </p>
          <button
            onClick={() => navigate("/collection")}
            className="mt-4 px-6 py-2 bg-[#005530] hover:bg-green-800 text-white rounded-md hover:opacity-90 transition"
          >
            Shop Now
          </button>
        </div>
      ) : (
        <div>
          {orderData.map((item, index) => (
            <div
              key={index}
              className="py-4 border-t border-b text-gray-200 grid grid-cols-1 md:grid-cols-3 gap-6 items-center"
            >
              {/* Item Details */}
              <div className="flex items-start gap-4 text-sm">
                <img className="w-16 sm:w-20" src={item.image[0]} alt="" />
                <div>
                  <p className="sm:text-base font-medium">{item.name}</p>
                  <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-200">
                    <p>₹{item.discount}</p>
                    <p>Qty: {item.quantity}</p>
                    <p>Size: {item.size}</p>
                  </div>
                  <p className="text-sm text-gray-200 mt-1">
                    Date: {new Date(item.date).toDateString()}
                  </p>
                  <p className="text-sm text-gray-200">
                    Payment: {item.paymentMethod}
                  </p>
                </div>
              </div>

              {/* Tracking Progress */}
              <div className="flex flex-col gap-2 px-4">
                {item.trackingSteps && item.trackingSteps.length > 0 ? (
                  item.trackingSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 text-sm ${
                        step.current_status === "Delivered"
                          ? "text-green-400"
                          : "text-gray-200"
                      }`}
                    >
                      <span
                        className={`w-3 h-3 rounded-full ${
                          step.current_status === "Delivered"
                            ? "bg-green-500"
                            : "bg-gray-500"
                        }`}
                      ></span>
                      <p>
                        {step.current_status} - {step.status_date}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">
                    Tracking not available yet
                  </p>
                )}
              </div>

              {/* Cancel Button */}
              <div className="flex justify-center md:justify-end">
                {(item.status === "Order Placed" ||
                  item.status === "Out for delivery") && (
                  <button
                    onClick={() => {
                      setSelectedOrderId(item._id);
                      setShowModal(true);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-6 py-2 rounded"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-gray-700 p-6 rounded-lg shadow-lg max-w-sm w-full">
            <p className="text-gray-200 font-semibold text-center mb-6">
              Do you really want to cancel this order?
            </p>
            <div className="flex justify-center gap-6">
              {isLoading ? (
                <svg
                  className="animate-spin h-6 w-6 text-red-600"
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
                <>
                  <button
                    onClick={handleCancelOrder}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="bg-gray-600 hover:bg-gray-800 text-white px-4 py-2 rounded"
                  >
                    No
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
