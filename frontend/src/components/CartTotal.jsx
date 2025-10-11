// components/CartTotal.jsx
import React, { useContext, useEffect, useState, useRef } from "react";
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
  const [showDropdown, setShowDropdown] = useState(false); // <-- fix: define state

  const wrapperRef = useRef(null);

  const finalAmount = getCartAmount() + delivery_fee - discountAmount;

  const fetchCouponsList = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/coupon`);
      if (data.success) {
        setCoupons(Array.isArray(data.coupons) ? data.coupons : []);
      }
    } catch (err) {
      console.error("fetchCouponsList error:", err);
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

  // close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setShowDropdown(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const applyCoupon = async (code) => {
    const codeToUse = (code ?? couponCode)?.trim();
    if (!codeToUse) {
      toast.error("Please enter coupon code");
      return;
    }

    try {
      const res = await axios.get(
        `${backendUrl}/api/coupon/validate/${encodeURIComponent(codeToUse)}`,
        { headers: token ? { token } : {} }
      );

      if (res.data.success && res.data.coupon) {
        const c = res.data.coupon;
        const discountPercent = Number(c.discountPercent ?? 0);
        const discount = (getCartAmount() * discountPercent) / 100;

        setAppliedCoupon(c);
        setDiscountAmount(discount);
        setCouponCode(c.code); // keep input synced
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

  // filter coupons by current input so the dropdown is useful while typing
  const visibleCoupons = couponCode
    ? coupons.filter((c) =>
        c.code?.toLowerCase().includes(couponCode.toLowerCase())
      )
    : coupons;

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
        <div className="mt-3 relative" ref={wrapperRef}>
          <div className="flex">
            <input
              type="text"
              placeholder="Enter coupon"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              onFocus={() => setShowDropdown(true)} // show dropdown when user clicks input
              className="bg-[#1A0E0E] border border-gray-700 text-white p-2 flex-1 rounded-l"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyCoupon(couponCode);
                  setShowDropdown(false);
                }
              }}
            />
            <button
              type="button"
              className="bg-green-700 hover:bg-green-600 text-white px-4 rounded-r"
              onClick={() => {
                applyCoupon(couponCode);
                setShowDropdown(false);
              }}
            >
              Apply
            </button>
          </div>

          {/* Dropdown (shown only when input is focused) */}
          {showDropdown && (
            <div className="absolute z-50 mt-1 w-full bg-[#1A0E0E] border border-gray-700 rounded shadow-lg max-h-56 overflow-auto">
              {visibleCoupons.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-400">
                  No coupons available
                </div>
              ) : (
                visibleCoupons.map((coup, index) => (
                  <button
                    key={coup._id ?? coup.code ?? index}
                    type="button"
                    onClick={() => {
                      setCouponCode(coup.code);
                      applyCoupon(coup.code); // apply immediately on click
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-700 text-sm text-white"
                  >
                    <div className="flex justify-between items-center">
                      <span>{coup.code}</span>
                      <span className="text-gray-300 text-xs">
                        {coup.discountPercent}% off
                      </span>
                    </div>
                    {coup.description && (
                      <div className="text-xs text-gray-400">
                        {coup.description}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CartTotal;
