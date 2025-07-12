import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import Title from "../components/Title";
import axios from "axios";

const Profile = () => {
  const { backendUrl, token, currency, setToken, setCartItems } =
    useContext(ShopContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [orderData, setOrderData] = useState([]);
  const [user, setUser] = useState({
    name: "User",
    email: "user@example.com",
    avatar: assets.user_icon,
  });

  // Load user data and orders
  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (!token) return;

        // In a real app, you would fetch user data from your backend
        // const response = await axios.get(backendUrl + "/api/user", { headers: { token } });
        // setUser(response.data.user);

        loadOrderData();
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, [token]);

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
          order.items.map((item) => {
            item["status"] = order.status;
            item["payment"] = order.payment;
            item["paymentMethod"] = order.paymentMethod;
            item["date"] = order.date;
            allOrdersItem.push(item);
          });
        });
        setOrderData(allOrdersItem.reverse());
      }
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  };

  const logout = () => {
    navigate("/login");
    localStorage.removeItem("token");
    setToken("");
    setCartItems({});
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  const submitPasswordChange = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords don't match!");
      return;
    }
    alert("Password changed successfully!");
    setShowChangePassword(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 py-12 px-4 sm:px-6 lg:px-8 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center sm:flex-row gap-6">
            <div className="relative">
              <img
                src={user.avatar}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-white border-opacity-30 object-cover"
              />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="text-indigo-100 mt-1">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab("profile")}
            className={`py-3 px-6 font-medium text-sm ${
              activeTab === "profile"
                ? "border-b-2 border-indigo-500 text-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`py-3 px-6 font-medium text-sm ${
              activeTab === "orders"
                ? "border-b-2 border-indigo-500 text-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            My Orders
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Account Settings</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                      {user.name}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                      {user.email}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Password</h3>
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                >
                  Change Password
                </button>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div>
            <div className="text-2xl mb-6">
              <Title text1={"MY"} text2={"ORDERS"} />
            </div>

            {orderData.length > 0 ? (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {orderData.map((item, index) => (
                  <div
                    key={index}
                    className="p-6 border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Product Image and Info */}
                      <div className="flex items-start gap-4 w-full md:w-1/2">
                        <img
                          className="w-20 h-20 object-cover rounded-lg"
                          src={item.image[0]}
                          alt={item.name}
                        />
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {item.name}
                          </h3>
                          <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-600">
                            <p>
                              {currency}
                              {item.price}
                            </p>
                            <p>· Qty: {item.quantity}</p>
                            <p>· Size: {item.size}</p>
                          </div>
                          <p className="mt-2 text-sm text-gray-500">
                            Ordered on {new Date(item.date).toDateString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            Payment: {item.paymentMethod}
                          </p>
                        </div>
                      </div>

                      {/* Order Status */}
                      <div className="w-full md:w-1/2">
                        <div className="flex items-center justify-between relative mb-4">
                          {[
                            "Order Placed",
                            "Out for delivery",
                            "Delivered",
                          ].map((step, i) => {
                            const currentStep = [
                              "Order Placed",
                              "Out for delivery",
                              "Delivered",
                            ].indexOf(item.status);
                            const isCompleted = i <= currentStep;

                            return (
                              <div
                                key={i}
                                className="flex-1 flex flex-col items-center relative"
                              >
                                <div
                                  className={`w-5 h-5 rounded-full z-10 border-2 flex items-center justify-center text-white text-xs ${
                                    isCompleted
                                      ? "bg-green-500 border-green-500"
                                      : "bg-white border-gray-300"
                                  }`}
                                >
                                  {isCompleted ? "✓" : ""}
                                </div>
                                <p
                                  className={`text-xs mt-1 ${
                                    isCompleted
                                      ? "text-green-600 font-medium"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {step}
                                </p>
                                {i < 2 && (
                                  <div
                                    className={`absolute top-2.5 left-1/2 w-full h-[2px] -z-10 ${
                                      currentStep > i
                                        ? "bg-green-500"
                                        : "bg-gray-300"
                                    }`}
                                  ></div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-sm font-medium ${
                              item.status === "Delivered"
                                ? "text-green-600"
                                : "text-indigo-600"
                            }`}
                          >
                            {item.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No orders yet
                </h3>
                <p className="mt-2 text-gray-500">
                  Your order history will appear here once you make a purchase.
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                >
                  Start Shopping
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Change Password
              </h2>
              <form onSubmit={submitPasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowChangePassword(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
