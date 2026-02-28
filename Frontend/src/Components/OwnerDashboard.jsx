import axios from 'axios';
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import { FaUtensils, FaEdit, FaPen } from "react-icons/fa";
import useGetShopDetails from '../hooks/useGetShopDetails';

import { useNavigate } from 'react-router-dom';
import ShopItems from './ShopItems';
import useGetShopItems from '../hooks/useGetShopItems';
import { setShopDetails } from '../redux/shopSlice';

function OwnerDashboard() {

    useGetShopDetails();
    useGetShopItems();

    const [open, setOpen] = useState(false);

    const fullname = useSelector((state) => state.user.userInfo?.fullname);
    const shopDetails = useSelector((state) => state.shop?.shopDetails);
    const shopItems = useSelector((state) => state.shop.items);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const str = fullname?.charAt(0).toUpperCase();

    const handleLogout = async () => {
        try {
            await axios.post(
                `${import.meta.env.VITE_SERVER_URL}/api/v1/auth/logout`,
                {},
                { withCredentials: true }
            );

            dispatch(setUserData(null));
            dispatch(setShopDetails(null));
            navigate("/login");

        } catch (error) {
            console.error(error.response?.data || error.message);
        }
    };

    return (
        <>
            {/* NAVBAR */}
            <nav className='flex items-center justify-between px-6 mt-2'>
                <h1 className='text-3xl text-amber-500'>BiteRush</h1>

                {shopDetails && (
                    <div className='flex gap-3'>
                        <button className='w-48 rounded-2xl bg-amber-500 py-2' onClick={()=> navigate('/add-item')}>
                            <span className='mr-1'>+</span>
                            Add Food Items
                        </button>

                        <button className='w-48 rounded-2xl bg-amber-500 py-2'>
                            My Orders
                        </button>
                    </div>
                )}

                {/* PROFILE DROPDOWN */}
                <div className="relative">
                    <button
                        onClick={() => setOpen(!open)}
                        className="rounded-full bg-amber-500 w-9 h-9 flex items-center justify-center text-amber-50 text-xl"
                    >
                        {str}
                    </button>

                    {open && (
                        <div className="absolute top-12 right-0 bg-white shadow-lg rounded-lg w-32">
                            <button
                                className="w-full px-4 py-2 text-left hover:bg-gray-100 rounded-lg"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            {/* WELCOME */}
            {shopDetails && (
                <div className='mt-20 flex items-center justify-center'>
                    <h1 className='text-5xl sm:text-7xl text-center'>
                        Welcome to {shopDetails.name}
                    </h1>
                </div>
            )}

            {/* CREATE SHOP CARD */}
            {!shopDetails && (
                <div className='flex justify-center items-center p-6'>
                    <div className='w-full max-w-md bg-white shadow-lg rounded-2xl p-6'>
                        <div className='flex flex-col items-center text-center'>
                            <FaUtensils className='text-[#ff4d2d] w-20 h-20 mb-4' />
                            <h2 className='text-2xl font-bold mb-2'>Add Your Restaurant</h2>
                            <p className='text-gray-600 mb-4'>
                                Join our platform and reach hungry customers.
                            </p>
                            <button
                                className='bg-[#ff4d2d] text-white px-6 py-2 rounded-full'
                                onClick={() => navigate("/create-edit")}
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* SHOP DETAILS CARD */}
            {shopDetails && (
                <div className='w-full flex justify-center px-6 mt-10'>
                    <div className='bg-white shadow-lg rounded-xl overflow-hidden w-full max-w-3xl relative'>
                        <div
                            className='absolute top-4 right-4 bg-[#ff4d2d] text-white p-2 rounded-full cursor-pointer'
                            onClick={() => navigate("/create-edit")}
                        >
                            <FaPen size={20} />
                        </div>

                        <img
                            src={shopDetails.shopImage}
                            alt={shopDetails.name}
                            className='w-full h-64 object-cover'
                        />

                        <div className='p-6'>
                            <h1 className='text-2xl font-bold mb-2'>
                                {shopDetails.name}
                            </h1>
                            <p className='text-gray-500'>
                                {shopDetails.city}, {shopDetails.state}
                            </p>
                            <p className='text-gray-500'>
                                {shopDetails.address}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {shopItems.length === 0 &&
                <div className='flex justify-center items-center p-4 sm:p-6'>
                    <div className='w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300'>
                        <div className='flex flex-col items-center text-center'>
                            <FaUtensils className='text-[#ff4d2d] w-16 h-16 sm:w-20 sm:h-20 mb-4' />
                            <h2 className='text-xl sm:text-2xl font-bold text-gray-800 mb-2'>Add Your Food Item</h2>
                            <p className='text-gray-600 mb-4 text-sm sm:text-base'>Share your delicious creations with our customers by adding them to the menu.
                            </p>
                            <button className='bg-[#ff4d2d] text-white px-5 sm:px-6 py-2 rounded-full font-medium shadow-md hover:bg-orange-600 transition-colors duration-200' onClick={() => navigate("/add-item")}>
                                Add Food
                            </button>
                        </div>
                    </div>
                </div>
            }

            {shopItems.length > 0 &&
                <div className='flex flex-col items-center gap-4 w-full max-w-3xl ml-96 mt-6 mb-3'>
                    {shopItems.map((item) => (
                        <ShopItems data={item} key={item._id} />
                    ))}


                </div>

            }
        </>
    );
}

export default OwnerDashboard;
