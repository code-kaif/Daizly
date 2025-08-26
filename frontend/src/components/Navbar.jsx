import { useContext, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { Search, User, ShoppingCart, Menu, X } from "lucide-react";
import { assets } from "../assets/assets";

const Navbar = () => {
  const [visible, setVisible] = useState(false);

  const {
    setShowSearch,
    getCartCount,
    navigate,
    token,
    setToken,
    setCartItems,
  } = useContext(ShopContext);

  const logout = () => {
    navigate("/login");
    localStorage.removeItem("token");
    setToken("");
    setCartItems({});
  };

  return (
    <div className="flex items-center justify-between py-5 font-medium">
      <Link to="/">
        <img src={assets.logo} className="w-28" alt="Logo" />
      </Link>

      <ul className="hidden sm:flex gap-5 text-sm text-white">
        <NavLink to="/" className="flex flex-col items-center gap-1">
          <p>HOME</p>
        </NavLink>
        <NavLink to="/collection" className="flex flex-col items-center gap-1">
          <p>PRODUCTS</p>
        </NavLink>
        <NavLink to="/about" className="flex flex-col items-center gap-1">
          <p>ABOUT</p>
        </NavLink>
        <NavLink to="/contact" className="flex flex-col items-center gap-1">
          <p>CONTACT</p>
        </NavLink>
      </ul>

      <div className="flex items-center gap-6">
        {/* Search Icon */}
        <Search
          size={20}
          className="cursor-pointer text-white"
          onClick={() => {
            setShowSearch(true);
            navigate("/collection");
          }}
        />

        {/* Profile Icon with Dropdown */}
        <div className="group relative">
          <User
            size={20}
            className="cursor-pointer text-white"
            onClick={() => (token ? null : navigate("/login"))}
          />
          {token && (
            <div className="group-hover:block hidden absolute dropdown-menu right-0 pt-4">
              <div className="flex flex-col gap-2 w-36 py-3 px-5 bg-gray-700 text-gray-200 rounded">
                <p
                  onClick={() => navigate("/orders")}
                  className="cursor-pointer text-white hover:text-gray-300"
                >
                  My Orders
                </p>
                <p
                  onClick={logout}
                  className="cursor-pointer text-red-500 hover:text-red-700"
                >
                  Logout
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Cart Icon */}
        <Link to="/cart" className="relative">
          <ShoppingCart size={20} className="text-white" />
          <p className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]">
            {getCartCount()}
          </p>
        </Link>

        {/* Menu Icon for mobile */}
        <Menu
          size={20}
          className="cursor-pointer text-white sm:hidden"
          onClick={() => setVisible(true)}
        />
      </div>

      {/* Sidebar menu for small screens */}
      <div
        className={`z-10 absolute top-0 right-0 bottom-0 overflow-hidden bg-[#0E0505] transition-all ${
          visible ? "w-full" : "w-0"
        }`}
      >
        <div className="relative h-full flex flex-col text-white">
          {/* Close Button (top-right) */}
          <button
            onClick={() => setVisible(false)}
            className="absolute top-5 right-5 cursor-pointer"
          >
            <X size={28} className="text-white" />
          </button>

          {/* Centered Nav Links */}
          <div className="flex flex-col items-center justify-center gap-8 h-full text-lg">
            <NavLink
              onClick={() => setVisible(false)}
              to="/"
              className="hover:text-gray-400 transition"
            >
              HOME
            </NavLink>
            <NavLink
              onClick={() => setVisible(false)}
              to="/collection"
              className="hover:text-gray-400 transition"
            >
              COLLECTION
            </NavLink>
            <NavLink
              onClick={() => setVisible(false)}
              to="/about"
              className="hover:text-gray-400 transition"
            >
              ABOUT
            </NavLink>
            <NavLink
              onClick={() => setVisible(false)}
              to="/contact"
              className="hover:text-gray-400 transition"
            >
              CONTACT
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
