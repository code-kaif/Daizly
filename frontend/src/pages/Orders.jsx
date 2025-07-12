import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);
  const [orderData, setorderData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const navigate = useNavigate();

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
        response.data.orders.map((order) => {
          if (!(order.status === "Cancelled" && order.orderCancelled)) {
            order.items.forEach((item) => {
              item["_id"] = order._id;
              item["status"] = order.status;
              item["payment"] = order.payment;
              item["paymentMethod"] = order.paymentMethod;
              item["date"] = order.date;
              order["orderCancelled"] && (item["cancelled"] = true);
              allOrdersItem.push(item);
            });
          }
        });

        setorderData(allOrdersItem.reverse());
      }
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  };

  const handleCancelOrder = async () => {
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
          <p className="text-lg font-semibold text-gray-600">
            You haven't any Order, Go for Shopping!
          </p>
          <button
            onClick={() => navigate("/collection")}
            className="mt-4 px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-md hover:opacity-90 transition"
          >
            Shop Now
          </button>
        </div>
      ) : (
        <div>
          {orderData.map((item, index) => (
            <div
              key={index}
              className="py-4 border-t border-b text-gray-700 grid grid-cols-1 md:grid-cols-3 gap-6 items-center"
            >
              {/* Item Details */}
              <div className="flex items-start gap-4 text-sm">
                <img className="w-16 sm:w-20" src={item.image[0]} alt="" />
                <div>
                  <p className="sm:text-base font-medium">{item.name}</p>
                  <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-700">
                    <p>₹{item.price}</p>
                    <p>Qty: {item.quantity}</p>
                    <p>Size: {item.size}</p>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Date: {new Date(item.date).toDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Payment: {item.paymentMethod}
                  </p>
                </div>
              </div>

              {/* Tracking Progress */}
              <div className="flex items-center justify-between px-4">
                {(() => {
                  const steps = [
                    "Order Placed",
                    "Out for delivery",
                    "Delivered",
                  ];
                  const currentStep = steps.indexOf(item.status);

                  return steps.map((step, idx) => {
                    const isCompleted = idx <= currentStep;
                    return (
                      <div
                        key={idx}
                        className="flex flex-col items-center relative w-full"
                      >
                        <div
                          className={`w-5 h-5 rounded-full z-10 border-2 flex items-center justify-center text-white text-[10px] font-bold ${
                            isCompleted
                              ? "bg-green-500 border-green-500"
                              : "bg-white border-gray-300"
                          }`}
                        >
                          {isCompleted ? "✓" : ""}
                        </div>
                        <p
                          className={`text-[11px] sm:text-xs mt-1 text-center ${
                            isCompleted
                              ? "text-green-600 font-semibold"
                              : "text-gray-400"
                          }`}
                        >
                          {step}
                        </p>
                        {idx < steps.length - 1 && (
                          <div
                            className={`absolute top-2.5 left-1/2 w-full h-[2px] -z-10 ${
                              currentStep > idx ? "bg-green-500" : "bg-gray-300"
                            }`}
                          ></div>
                        )}
                      </div>
                    );
                  });
                })()}
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
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <p className="text-gray-700 font-semibold text-center mb-6">
              Do you really want to cancel this order?
            </p>
            <div className="flex justify-center gap-6">
              <button
                onClick={handleCancelOrder}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Yes
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
