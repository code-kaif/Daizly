// Admin

import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);

  // Function to convert numeric status codes to readable text
  const getStatusDisplay = (status) => {
    if (status === undefined || status === null) return "Unknown Status";

    const statusMap = {
      // Numeric status mappings (Shiprocket codes)
      0: "Order Placed",
      1: "Processing",
      2: "Processing",
      3: "Dispatched",
      4: "In Transit",
      5: "Out for Delivery",
      6: "Delivered",
      7: "Cancelled",
      8: "RTO",
      9: "Lost",
      10: "Damaged",
      11: "Processing",
      12: "Processing",

      // String status mappings
      "New Order": "Order Placed",
      "Order Confirmed": "Order Placed",
      Processing: "Processing",
      "Manifest Generated": "Processing",
      Dispatched: "Dispatched",
      "In Transit": "In Transit",
      "Out for Delivery": "Out for Delivery",
      Delivered: "Delivered",
      Cancelled: "Cancelled",
      "Returned to Origin": "RTO",
      Lost: "Lost",
      Damaged: "Damaged",
      "No Tracking Data": "Processing",
      "Order Confirmed": "Order Placed",
      "Tracking Error": "Processing",
      "Not Found": "Processing",
    };

    const stringStatus = String(status);
    return statusMap[stringStatus] || stringStatus;
  };

  // Function to get status color
  const getStatusColor = (status) => {
    const displayStatus = getStatusDisplay(status);

    if (displayStatus === "Delivered") return "green";
    if (
      displayStatus === "Cancelled" ||
      displayStatus === "RTO" ||
      displayStatus === "Lost" ||
      displayStatus === "Damaged"
    )
      return "red";
    if (displayStatus === "Out for Delivery") return "blue";
    if (
      displayStatus === "Processing" ||
      displayStatus === "Order Placed" ||
      displayStatus === "Dispatched" ||
      displayStatus === "In Transit"
    )
      return "yellow";
    return "gray";
  };

  // FIXED admin api call
  const fetchAllOrders = async () => {
    if (!token) return;

    try {
      const response = await axios.post(
        backendUrl + "/api/order/list",
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        let ordersData = response.data.orders.reverse();

        // Filter out cancelled and RTO orders
        ordersData = ordersData.filter(
          (order) =>
            !order.orderCancelled &&
            order.status !== "Cancelled" &&
            order.status !== "RTO" &&
            order.status !== "8" // RTO numeric code
        );

        // FIX: Use POST method with proper request body
        const trackRes = await axios.post(
          backendUrl + "/api/order/track-all",
          { orderIds: ordersData.map((o) => o._id) },
          { headers: { token } }
        );

        if (trackRes.data.success) {
          const tracking = trackRes.data.tracking;
          ordersData = ordersData.map((order) => ({
            ...order,
            trackingSteps: tracking[order._id] || [],
          }));
        }

        setOrders(ordersData);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/order/status",
        { orderId, status: event.target.value },
        { headers: { token } }
      );
      if (response.data.success) {
        await fetchAllOrders();
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  return (
    <div>
      <h3>Order Page</h3>
      <div>
        {orders.length === 0 ? (
          <p className="text-gray-200 my-3 md:my-4">No orders found.</p>
        ) : (
          orders.map((order, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-200"
            >
              <img className="w-12" src={assets.parcel_icon} alt="" />
              <div>
                <div>
                  {order.items.map((item, i) => (
                    <p className="py-0.5" key={i}>
                      {item.name} x {item.quantity} <span>{item.size}</span>
                      {i !== order.items.length - 1 && ","}
                    </p>
                  ))}
                </div>
                <div className="flex gap-2">
                  <p className="mt-3 mb-2 font-medium">
                    {order.address.firstName} {order.address.lastName}
                  </p>
                  <p className="mt-3 mb-2 font-medium">
                    {order.address.instagramId}
                  </p>
                </div>
                <div>
                  <p>
                    {order.address.houseNo}, {order.address.street}
                  </p>
                  <p>
                    {order.address.area}, {order.address.city},{" "}
                    {order.address.state}, {order.address.zipcode}
                  </p>
                </div>
                <p>{order.address.phone}</p>
              </div>

              <div>
                <p className="text-sm sm:text-[15px]">
                  Items: {order.items.length}
                </p>
                <p className="mt-3">Method: {order.paymentMethod}</p>
                <p>Payment: {order.payment ? "Done" : "Pending"}</p>
                <p>Date: {new Date(order.date).toLocaleDateString()}</p>
              </div>

              <p className="text-sm sm:text-[15px]">
                {currency}
                {order.amount}
              </p>

              <div>
                <h4 className="font-semibold">Tracking:</h4>
                {order.trackingSteps && order.trackingSteps.length > 0 ? (
                  order.trackingSteps.map((step, idx) => {
                    const displayStatus = getStatusDisplay(step.current_status);
                    const statusColor = getStatusColor(step.current_status);

                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-2 text-xs text-${statusColor}-400`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full bg-${statusColor}-500`}
                        ></span>
                        <p>
                          {displayStatus} – {step.status_date}
                          {step.message && ` (${step.message})`}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                    <p>Tracking not available yet</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;
