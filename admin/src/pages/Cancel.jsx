import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Cancel = ({ token }) => {
  const [cancelledOrders, setCancelledOrders] = useState([]);

  // Helper function to get image URL from either old or new schema
  const getImageUrl = (product) => {
    // Try new schema first: product.images array of objects
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

    // Fallback to old schema: product.image array of strings
    if (
      product.image &&
      Array.isArray(product.image) &&
      product.image.length > 0
    ) {
      return product.image[0];
    }

    // Return a placeholder if no image found
    return "https://via.placeholder.com/48";
  };

  // Helper to check if URL is a video
  const isVideoUrl = (url) => {
    if (!url) return false;
    return (
      /\.(mp4|webm|ogg|mov|avi|wmv)$/i.test(url) ||
      url.includes("/video/") ||
      url.includes("video=true")
    );
  };

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
        <p className="text-gray-200 my-3 md:my-4">No cancelled orders found.</p>
      ) : (
        <div className="space-y-6 my-3 md:my-4">
          {cancelledOrders.map((order, idx) => (
            <div
              key={idx}
              className="shadow-sm border border-gray-300 p-6 rounded-md text-gray-200"
            >
              {/* Order Header */}
              <div className="mb-4 grid sm:grid-cols-2 gap-2 text-sm text-gray-200">
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
                {order.items.map((item, index) => {
                  const imageUrl = getImageUrl(item);
                  const isVideo = isVideoUrl(imageUrl);

                  return (
                    <div
                      key={index}
                      className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-4"
                    >
                      <div className="flex items-start gap-4 text-sm w-full md:w-1/2">
                        {isVideo ? (
                          <div className="relative">
                            <video
                              src={imageUrl}
                              className="w-12 h-12 object-cover rounded"
                              muted
                              autoPlay
                              loop
                            />
                            <div className="absolute top-0 left-0 bg-black bg-opacity-50 px-1 text-xs">
                              VID
                            </div>
                          </div>
                        ) : (
                          <img
                            src={imageUrl}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/48";
                            }}
                          />
                        )}

                        <div>
                          <p className="font-medium text-gray-200">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-200 mt-1">
                            ₹{item.discount} | Quantity: {item.quantity} | Size:{" "}
                            {item.size}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Cancel;
