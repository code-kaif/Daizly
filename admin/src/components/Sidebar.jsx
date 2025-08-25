import React from "react";
import { NavLink } from "react-router-dom";
import { TbFileExport } from "react-icons/tb";
import { LuClipboardList } from "react-icons/lu";
import { IoIosAddCircleOutline } from "react-icons/io";
import { BsBox } from "react-icons/bs";
import { HiOutlineArchiveBoxXMark } from "react-icons/hi2";

const Sidebar = () => {
  return (
    <div className="w-[18%] min-h-screen bg-[#0E0505] text-white border-r">
      <div className="flex flex-col gap-4 pt-6 pl-[20%] text-[15px]">
        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-l-md transition-all duration-200 ${
              isActive ? "bg-white text-[#0E0505]" : "hover:bg-[#1a0a0a]"
            }`
          }
          to="/add"
        >
          <IoIosAddCircleOutline size={24} />
          <p className="hidden md:block">Add</p>
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-l-md transition-all duration-200 ${
              isActive ? "bg-white text-[#0E0505]" : "hover:bg-[#1a0a0a]"
            }`
          }
          to="/list"
        >
          <LuClipboardList size={24} />
          <p className="hidden md:block">List</p>
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-l-md transition-all duration-200 ${
              isActive ? "bg-white text-[#0E0505]" : "hover:bg-[#1a0a0a]"
            }`
          }
          to="/orders"
        >
          <BsBox size={24} />
          <p className="hidden md:block">Orders</p>
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-l-md transition-all duration-200 ${
              isActive ? "bg-white text-[#0E0505]" : "hover:bg-[#1a0a0a]"
            }`
          }
          to="/cancel"
        >
          <HiOutlineArchiveBoxXMark size={24} />
          <p className="hidden md:block">Cancel</p>
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-l-md transition-all duration-200 ${
              isActive ? "bg-white text-[#0E0505]" : "hover:bg-[#1a0a0a]"
            }`
          }
          to="/exports"
        >
          <TbFileExport size={24} />
          <p className="hidden md:block">Export</p>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
