import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Trash2 } from "lucide-react";
import { backendUrl } from "../App";

const Coupon = () => {
  const [coupons, setCoupons] = useState([]);
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");

  // Fetch all coupons
  const fetchCoupons = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/coupon`);
      if (data.success) {
        setCoupons(data.coupons);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Create coupon
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!code || !discountPercent) {
      return toast.error("All fields are required");
    }
    try {
      const { data } = await axios.post(`${backendUrl}/api/coupon`, {
        code,
        discountPercent,
      });
      if (data.success) {
        toast.success("Coupon Created");
        setCode("");
        setDiscountPercent("");
        fetchCoupons();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error creating coupon");
    }
  };

  // Delete coupon
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const { data } = await axios.delete(`${backendUrl}/api/coupon/${id}`);
      if (data.success) {
        toast.success("Coupon Deleted");
        fetchCoupons();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting coupon");
    }
  };

  return (
    <div className="min-h-screen text-white">
      <p className="mb-2">Coupon Management</p>

      {/* Create Coupon Form */}
      <form
        onSubmit={handleCreate}
        className="bg-[#1e293b] p-4 rounded-2xl shadow-md mb-6 flex flex-col sm:flex-row gap-4 mt-5"
      >
        <input
          type="text"
          placeholder="Coupon Code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="flex-1 px-4 py-2 rounded-lg bg-[#0f172a] border border-gray-600 text-white focus:outline-none"
        />
        <input
          type="number"
          placeholder="Discount %"
          value={discountPercent}
          onChange={(e) => setDiscountPercent(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg bg-[#0f172a] border border-gray-600 text-white focus:outline-none"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-green-900 text-white font-semibold rounded-lg hover:bg-green-950 transition"
        >
          Create
        </button>
      </form>

      {/* Coupon List */}
      <div className="overflow-x-auto bg-[#1e293b] rounded-2xl shadow-md">
        <table className="min-w-full text-sm text-left text-gray-300">
          <thead className="bg-[#0f172a] text-gray-400 uppercase">
            <tr>
              <th className="px-6 py-3">Code</th>
              <th className="px-6 py-3">Discount (%)</th>
              <th className="px-6 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length > 0 ? (
              coupons.map((c) => (
                <tr key={c._id} className="border-b border-gray-700">
                  <td className="px-6 py-4 font-medium">{c.code}</td>
                  <td className="px-6 py-4">{c.discountPercent}%</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="p-2 bg-red-600 rounded-lg hover:bg-red-700 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="3"
                  className="text-center py-6 text-gray-500 italic"
                >
                  No coupons found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Coupon;
