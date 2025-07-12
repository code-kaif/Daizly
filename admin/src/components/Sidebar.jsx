import React from "react";
import { NavLink } from "react-router-dom";
import { TbFileExport } from "react-icons/tb";
import { LuClipboardList } from "react-icons/lu";
import { IoIosAddCircleOutline } from "react-icons/io";
import { BsBox } from "react-icons/bs";
import { HiOutlineArchiveBoxXMark } from "react-icons/hi2";

const Sidebar = () => {
  return (
    <div className="w-[18%] min-h-screen border-r-2">
      <div className="flex flex-col gap-4 pt-6 pl-[20%] text-[15px]">
        <NavLink
          className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l"
          to="/add"
        >
          <IoIosAddCircleOutline size={24} />
          <p className="hidden md:block">Add</p>
        </NavLink>

        <NavLink
          className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l"
          to="/list"
        >
          <span>
            <LuClipboardList size={24} />
          </span>
          <p className="hidden md:block">List</p>
        </NavLink>

        <NavLink
          className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l"
          to="/orders"
        >
          <BsBox size={24} />
          <p className="hidden md:block">Orders</p>
        </NavLink>

        <NavLink
          className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l"
          to="/cancel"
        >
          <HiOutlineArchiveBoxXMark size={24} />
          <p className="hidden md:block">Cancel</p>
        </NavLink>

        <NavLink
          className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l"
          to="/exports"
        >
          <span>
            <TbFileExport size={24} />
          </span>
          <p className="hidden md:block">Export</p>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
