import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { useLocation } from "react-router-dom";

// Icons from lucide-react
import { Search, X } from "lucide-react";

const SearchBar = () => {
  const { search, setSearch, showSearch, setShowSearch } =
    useContext(ShopContext);
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.includes("collection")) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [location]);

  return showSearch && visible ? (
    <div className="border-t border-b border-gray-700 text-center bg-[#0E0505]">
      <div className="inline-flex items-center justify-center border border-gray-600 px-5 py-2 my-5 mx-3 rounded-full w-3/4 sm:w-1/2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 outline-none bg-transparent text-sm text-white placeholder-gray-400"
          type="text"
          placeholder="Search"
        />
        {/* Search Icon */}
        <Search size={18} className="text-white cursor-pointer" />
      </div>

      {/* Close Icon */}
      <X
        onClick={() => setShowSearch(false)}
        size={18}
        className="inline cursor-pointer text-white ml-2"
      />
    </div>
  ) : null;
};

export default SearchBar;
