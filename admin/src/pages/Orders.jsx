import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);

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

        // 🔹 Fetch Shiprocket tracking for all orders
        const trackRes = await axios.get(
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
                <p className="mt-3 mb-2 font-medium">
                  {order.address.firstName} {order.address.lastName}
                </p>
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

              <div className="mt-2">
                <h4 className="font-semibold">Tracking:</h4>
                {order.trackingSteps && order.trackingSteps.length > 0 ? (
                  order.trackingSteps.map((step, idx) => (
                    <p key={idx} className="text-xs">
                      {step.current_status} – {step.status_date}
                    </p>
                  ))
                ) : (
                  <p className="text-xs text-gray-400">
                    Tracking not available
                  </p>
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
