import React, { useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const AdminExport = ({ token }) => {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const handleExport = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/order/export?date=${date}`,
        {
          headers: { token },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `orders-${date}.csv`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      toast.error("Failed to export orders");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-start md:p-6 p-3 md:mt-5 mt-1">
      <div className="w-full max-w-xl bg-white border shadow-sm md:p-8 p-4 rounded-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          📦 Export Orders (CSV)
        </h2>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
            }}
            className="border px-4 py-2 rounded w-full sm:w-auto"
          />
          <button
            onClick={handleExport}
            className="bg-gray-800 hover:bg-gray-900 text-white rounded-md px-6 py-2"
          >
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminExport;
