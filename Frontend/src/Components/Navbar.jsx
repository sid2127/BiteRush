import React, { useState } from "react";
import { FaLocationDot } from "react-icons/fa6";
import { IoIosSearch } from "react-icons/io";
import { FiShoppingCart } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import { TbReceipt2 } from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { SetSearchItem, setUserData } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";
import { setAllOrders } from "../redux/orderSlice";
import { useEffect } from "react";
import ItemCard from "./ItemCard";

function Nav() {

  const navigate = useNavigate();
  const userData = useSelector((state) => state.user.userInfo);
  const currentCity = useSelector((state) => state.user.currentCity);
  const cart = useSelector((state) => state.user.Cart)
  const items = useSelector((state) => state.user.searchItems);

  const [showInfo, setShowInfo] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");

  const dispatch = useDispatch();

  const handleOrders = async () => {
      navigate("/my-orders");
  
  };

  const handleLogOut = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/v1/auth/logout`,

        {},
        { withCredentials: true }
      );
      dispatch(setUserData(null));

    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const SearchItem = async () => {
    try {
      const result = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/v1/item/searchItems?query=${query}&city=${currentCity}`,
        { withCredentials: true }
      )

      console.log("All search items are : ", result);
      dispatch(SetSearchItem(result.data.data));

    } catch (error) {
      console.log("Error in searching items", error);
    }
  }

  useEffect(() => {
    if (query) {
      SearchItem();
    }
    else {
      dispatch(SetSearchItem([]));
    }
  }, [query])

  return (
    <>
      <div className="w-full h-20 flex items-center justify-between px-5 fixed top-0 z-50 bg-[#fff9f6]">

        {/* ---------- Mobile Search ---------- */}
        {showSearch && userData?.role === "User" && (
          <div className="w-[90%] h-16 bg-white shadow-xl rounded-lg flex items-center gap-4 fixed top-20 left-[5%] md:hidden">
            <div className="flex items-center w-[30%] gap-2 px-3 border-r">
              <FaLocationDot size={22} className="text-[#ff4d2d]" />
              <span className="truncate text-gray-600">{currentCity}</span>
            </div>
            <div className="flex items-center w-[70%] gap-2">
              <IoIosSearch size={22} className="text-[#ff4d2d]" />
              <input
                type="text"
                placeholder="Search food..."
                className="w-full outline-none"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* ---------- Logo ---------- */}
        <h1 className="text-3xl font-bold text-[#ff4d2d]">BiteRush</h1>

        {/* ---------- Desktop Search ---------- */}
        {userData?.role === "User" && (
          <div className="hidden md:flex w-[40%] h-16 bg-white shadow-xl rounded-lg items-center gap-4">
            <div className="flex items-center w-[30%] gap-2 px-3 border-r">
              <FaLocationDot size={22} className="text-[#ff4d2d]" />
              <span className="truncate text-gray-600">{currentCity}</span>
            </div>
            <div className="flex items-center w-[70%] gap-2">
              <IoIosSearch size={22} className="text-[#ff4d2d]" />
              <input
                type="text"
                placeholder="Search food..."
                className="w-full outline-none"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* ---------- Right Section ---------- */}
        <div className="flex items-center gap-4">

          {/* Mobile Search Toggle */}
          {userData?.role === "User" && (
            showSearch ? (
              <RxCross2
                size={24}
                className="text-[#ff4d2d] md:hidden cursor-pointer"
                onClick={() => setShowSearch(false)}
              />
            ) : (
              <IoIosSearch
                size={24}
                className="text-[#ff4d2d] md:hidden cursor-pointer"
                onClick={() => setShowSearch(true)}
              />
            )
          )}

          {/* User Cart (STATIC) */}
          {userData?.role === "User" && (
            <div className="relative" onClick={() => navigate('/Cart')}>
              <FiShoppingCart size={24} className="text-[#ff4d2d]" />
              <span className="absolute -top-2 -right-2 text-xs text-[#ff4d2d]">
                {cart?.length || 0}
              </span>
            </div>
          )}

          {/* Owner Orders (STATIC) */}
          {userData?.role === "Owner" && (
            <div
              className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] cursor-pointer"
              onClick={handleOrders}
            >
              <TbReceipt2 size={20} />
              <span className="hidden md:block">My Orders</span>
            </div>
          )}

          {/* Avatar */}
          {userData && (
            <div
              className="w-10 h-10 rounded-full bg-[#ff4d2d] text-white flex items-center justify-center font-semibold cursor-pointer"
              onClick={() => setShowInfo((prev) => !prev)}
            >
              {userData?.fullName?.slice(0, 1)}
            </div>
          )}

          {/* Profile Dropdown */}
          {showInfo && userData && (
            <div className="fixed top-20 right-4 w-44 bg-white shadow-xl rounded-xl p-4 flex flex-col gap-2">
              <div className="font-semibold">{userData.fullName}</div>

              <div
                className="text-[#ff4d2d] font-medium cursor-pointer"
                onClick={handleOrders}
              >
                My Orders
              </div>
              <div
                className="text-[#ff4d2d] font-medium cursor-pointer"
                onClick={handleLogOut}
              >
                Log Out
              </div>
            </div>
          )}
        </div>
      </div>
      {items.length > 0 &&
        <div className="w-3xl flex flex-col justify-center mt-20 bg-white rounded-lg shadow">
          <div className="text-3xl font-bold mb-2.5">Search Results</div>
          <div className='w-full h-auto flex flex-wrap gap-5 justify-center'>
            {items?.map((item, index) => (
              <ItemCard key={index} data={item} />
            ))}
          </div>
        </div>
      }

    </>
  );
}

export default Nav;
