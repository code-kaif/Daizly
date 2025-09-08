import React, { useContext, useState } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { assets } from "../assets/assets";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const PlaceOrder = () => {
  const [method, setMethod] = useState("cod");
  const [isLoading, setIsLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [finalAmount, setFinalAmount] = useState(0);

  const {
    navigate,
    backendUrl,
    token,
    cartItems,
    setCartItems,
    getCartAmount,
    delivery_fee,
    products,
  } = useContext(ShopContext);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    houseNo: "",
    street: "",
    area: "",
    city: "",
    state: "",
    zipcode: "",
    phone: "",
    instagramId: "",
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setFormData((data) => ({ ...data, [name]: value }));
  };

  // ✅ Razorpay init with finalAmount
  const initPay = (order, orderItems, finalAmount, appliedCoupon) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Order Payment",
      description: "Order Payment",
      order_id: order.id,
      handler: async (response) => {
        try {
          const payload = {
            ...response, // razorpay_order_id, razorpay_payment_id, signature
            items: orderItems,
            address: formData,
            amount: finalAmount,
            coupon: appliedCoupon || null,
          };

          const { data } = await axios.post(
            backendUrl + "/api/order/verifyRazorpay",
            payload,
            { headers: { token } }
          );

          if (data.success) {
            toast.success("Order placed successfully!");
            navigate("/orders");
            setCartItems({});

            // 🔹 Fire Purchase event
            if (window.fbq) {
              window.fbq("track", "Purchase", {
                value: finalAmount,
                currency: "INR",
                contents: orderItems.map((item) => ({
                  id: item._id,
                  quantity: item.quantity,
                })),
                num_items: orderItems.reduce(
                  (sum, item) => sum + item.quantity,
                  0
                ),
              });
            }
          } else {
            toast.error(data.message);
          }
        } catch (error) {
          console.error(error);
          toast.error(error.message);
        }
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    if (window.fbq) {
      window.fbq("track", "InitiateCheckout", {
        value: finalAmount,
        currency: "INR",
        contents: Object.keys(cartItems).flatMap((id) =>
          Object.keys(cartItems[id]).map((size) => ({
            id,
            quantity: cartItems[id][size],
          }))
        ),
        num_items: Object.values(cartItems).reduce(
          (sum, sizes) => sum + Object.values(sizes).reduce((a, b) => a + b, 0),
          0
        ),
      });
    }

    try {
      let orderItems = [];

      let subtotal = getCartAmount();
      let discountPercent =
        appliedCoupon?.discountPercent ?? appliedCoupon?.percentage ?? 0;
      let discount = appliedCoupon
        ? (subtotal * Number(discountPercent)) / 100
        : 0;
      let finalAmount = subtotal - discount + delivery_fee;

      // collect cart items
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            const itemInfo = structuredClone(
              products.find((product) => product._id === items)
            );
            if (itemInfo) {
              itemInfo.size = item;
              itemInfo.quantity = cartItems[items][item];
              orderItems.push(itemInfo);
            }
          }
        }
      }

      let orderData = {
        address: formData,
        items: orderItems,
        amount: finalAmount,
        coupon: appliedCoupon || null,
      };

      if (method === "cod") {
        // 🚫 restrict coupon for COD
        if (appliedCoupon) {
          toast.error("Coupons are only valid for prepaid orders");
          setIsLoading(false);
          return;
        }

        const response = await axios.post(
          backendUrl + "/api/order/place",
          orderData,
          { headers: { token } }
        );

        if (response.data.success) {
          setCartItems({});
          toast.success(response.data.message);
          navigate("/orders");

          // 🔹 Fire Purchase event
          if (window.fbq) {
            window.fbq("track", "Purchase", {
              value: finalAmount,
              currency: "INR",
              contents: orderItems.map((item) => ({
                id: item._id,
                quantity: item.quantity,
              })),
              num_items: orderItems.reduce(
                (sum, item) => sum + item.quantity,
                0
              ),
            });
          }
        } else {
          toast.error(response.data.message);
        }
      }

      if (method === "razorpay") {
        const responseRazorpay = await axios.post(
          backendUrl + "/api/order/razorpay",
          { amount: finalAmount }, // ✅ only send amount here
          { headers: { token } }
        );

        if (responseRazorpay.data.success) {
          initPay(
            responseRazorpay.data.order,
            orderItems,
            finalAmount,
            appliedCoupon
          );
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t"
    >
      {/* ------------- Left Side ---------------- */}
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1={"DELIVERY"} text2={"INFORMATION"} />
        </div>
        <div className="flex gap-3">
          <input
            required
            onChange={onChangeHandler}
            name="firstName"
            value={formData.firstName}
            className="bg-[#1A0E0E] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-gray-500 placeholder-gray-500 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="First name"
          />
          <input
            required
            onChange={onChangeHandler}
            name="lastName"
            value={formData.lastName}
            className="bg-[#1A0E0E] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-gray-500 placeholder-gray-500 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="Last name"
          />
        </div>
        <input
          required
          onChange={onChangeHandler}
          name="email"
          value={formData.email}
          className="bg-[#1A0E0E] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-gray-500 placeholder-gray-500 rounded py-1.5 px-3.5 w-full"
          type="email"
          placeholder="Email address"
        />
        <div className="flex gap-3">
          <input
            required
            onChange={onChangeHandler}
            name="houseNo"
            value={formData.houseNo}
            className="bg-[#1A0E0E] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-gray-500 placeholder-gray-500 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="HouseNo"
          />
          <input
            required
            onChange={onChangeHandler}
            name="street"
            value={formData.street}
            className="bg-[#1A0E0E] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-gray-500 placeholder-gray-500 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="Street"
          />
        </div>
        <div className="flex gap-3">
          <input
            required
            onChange={onChangeHandler}
            name="zipcode"
            value={formData.zipcode}
            className="bg-[#1A0E0E] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-gray-500 placeholder-gray-500 rounded py-1.5 px-3.5 w-full"
            type="number"
            placeholder="Pincode (Complete 6 numbers)"
          />
          <input
            required
            onChange={onChangeHandler}
            name="area"
            value={formData.area}
            className="bg-[#1A0E0E] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-gray-500 placeholder-gray-500 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="Area / Locality"
          />
        </div>
        <div className="flex gap-3">
          <input
            required
            onChange={onChangeHandler}
            name="city"
            value={formData.city}
            className="bg-[#1A0E0E] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-gray-500 placeholder-gray-500 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="City"
          />
          <input
            onChange={onChangeHandler}
            name="state"
            value={formData.state}
            className="bg-[#1A0E0E] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-gray-500 placeholder-gray-500 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="State"
          />
        </div>
        <input
          required
          onChange={onChangeHandler}
          name="phone"
          value={formData.phone}
          className="bg-[#1A0E0E] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-gray-500 placeholder-gray-500 rounded py-1.5 px-3.5 w-full"
          type="number"
          placeholder="Phone"
        />
        <div className>
          <p className="text-white my-2">
            Add instagramId for your NFC Tag. (Optional)
          </p>
          <input
            onChange={onChangeHandler}
            name="instagramId"
            value={formData.instagramId}
            className="bg-[#1A0E0E] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-gray-500 placeholder-gray-500 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="Instagram Id"
          />
        </div>
      </div>

      {/* ------------- Right Side ------------------ */}
      <div className="mt-8">
        <div className="mt-8 min-w-80">
          <CartTotal
            onFinalAmountChange={(amount, coupon) => {
              setFinalAmount(amount);
              setAppliedCoupon(coupon);
            }}
            showInput={true}
          />
        </div>

        <div className="mt-12">
          <Title text1={"PAYMENT"} text2={"METHOD"} />
          {/* Payment Methods */}
          <div className="flex gap-3 flex-col lg:flex-row">
            <div
              onClick={() => setMethod("cod")}
              className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === "cod" ? "bg-green-400" : ""
                }`}
              ></p>
              <p className="text-gray-500 text-sm font-medium mx-4">
                CASH ON DELIVERY
              </p>
            </div>
            <div
              onClick={() => setMethod("razorpay")}
              className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === "razorpay" ? "bg-green-400" : ""
                }`}
              ></p>
              <img className="h-5 mx-4" src={assets.razorpay_logo} alt="" />
            </div>
          </div>

          <div className="w-full text-end mt-8">
            <button
              disabled={isLoading}
              type="submit"
              className="bg-gray-900 hover:bg-gray-800 duration-200 rounded-md text-white px-16 py-3 text-sm"
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
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
                "Place Order"
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
