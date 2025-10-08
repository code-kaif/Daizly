// components/CartTotal.jsx
import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import axios from "axios";
import { toast } from "react-toastify";

const CartTotal = ({ onFinalAmountChange, showInput = false }) => {
  const { getCartAmount, delivery_fee, currency, backendUrl, token } =
    useContext(ShopContext);

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [coupons, setCoupons] = useState([]);

  const finalAmount = getCartAmount() + delivery_fee - discountAmount;

  const fetchCouponsList = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/coupon`);
      if (data.success) {
        setCoupons(data.coupons);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // notify parent (PlaceOrder) when final amount changes
  useEffect(() => {
    if (onFinalAmountChange) {
      onFinalAmountChange(finalAmount, appliedCoupon);
    }
    // eslint-disable-next-line
  }, [finalAmount, appliedCoupon]);

  useEffect(() => {
    fetchCouponsList();
  }, []);

  const applyCoupon = async (code) => {
    if (!code || !code.trim()) {
      toast.error("Please enter coupon code");
      return;
    }

    try {
      const res = await axios.get(
        `${backendUrl}/api/coupon/validate/${encodeURIComponent(code.trim())}`,
        { headers: token ? { token } : {} }
      );

      if (res.data.success && res.data.coupon) {
        const c = res.data.coupon;
        const discountPercent = Number(c.discountPercent ?? 0);
        const discount = (getCartAmount() * discountPercent) / 100;

        setAppliedCoupon(c);
        setDiscountAmount(discount);

        toast.success(
          `Coupon applied! You saved ${currency}${discount.toFixed(2)}`
        );
      } else {
        setAppliedCoupon(null);
        setDiscountAmount(0);
        toast.error(res.data.message || "Invalid coupon");
      }
    } catch (err) {
      console.error("applyCoupon error:", err?.response?.data ?? err);
      setAppliedCoupon(null);
      setDiscountAmount(0);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="w-full">
      <div className="text-2xl">
        <Title text1={"CART"} text2={"TOTALS"} />
      </div>

      <div className="flex flex-col gap-2 mt-2 text-sm text-white">
        <div className="flex justify-between">
          <p>Subtotal</p>
          <p>
            {currency} {getCartAmount().toFixed(2)}
          </p>
        </div>
        <hr />
        <div className="flex justify-between">
          <p>Shipping Fee</p>
          <p>
            {currency} {delivery_fee.toFixed(2)}
          </p>
        </div>
        <hr />
        {appliedCoupon && (
          <>
            <div className="flex justify-between text-green-400">
              <p>
                Discount ({appliedCoupon.code} - {appliedCoupon.discountPercent}
                %)
              </p>
              <p>
                -{currency} {discountAmount.toFixed(2)}
              </p>
            </div>
            <hr />
          </>
        )}
        <div className="flex justify-between font-bold">
          <b>Total</b>
          <b>
            {currency} {finalAmount.toFixed(2)}
          </b>
        </div>
      </div>

      {/* Coupon Input */}
      {showInput && (
        <div className="mt-3 flex">
          <input
            type="text"
            placeholder="Enter coupon"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="bg-[#1A0E0E] border border-gray-700 text-white p-2 flex-1 rounded-l"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyCoupon(couponCode);
              }
            }}
          />
          <button
            type="button"
            className="bg-green-700 hover:bg-green-600 text-white px-4 rounded-r"
            onClick={() => applyCoupon(couponCode)}
          >
            Apply
          </button>
        </div>
      )}
      {showInput && (
        <>
          <div className="text-white mt-2">
            <span>Available coupons: </span>
            <div className="mt-1">
              <select
                className="bg-gray-700 text-white px-2 py-1 rounded text-sm outline-none"
                defaultValue=""
              >
                <option value="" disabled>
                  See Available Coupon
                </option>
                {coupons.map((coup, index) => (
                  <option key={index} value={coup.code}>
                    {coup.code}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartTotal;
