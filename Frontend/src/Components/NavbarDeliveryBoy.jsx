import axios from 'axios';
import React from 'react'
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import { serverUrl } from '../App';

function NavbarDeliveryBoy() {

    const userData = useSelector((state) => state.user.userInfo);
    const [showInfo, setShowInfo] = useState(false);
    const dispatch = useDispatch();

    const handleLogOut = async () => {
        try {
          await axios.post(
            `${serverUrl}/api/v1/auth/logout`,
    
            {},
            { withCredentials: true }
          );
          dispatch(setUserData(null));
    
        } catch (error) {
          console.error("Logout failed", error);
        }
      };

    return (
        <div className='ml-96 mt-1.5 flex items-center gap-6'>
            <span className='text-3xl font-extrabold text-orange-400 mr-64'>BiteRush</span>

            <button className='bg-amber-500 rounded-3xl p-1.5'>
                <span>My Orders</span>
            </button>

            <div className="relative">
                {userData && (
                    <div
                        className="w-10 h-10 rounded-full bg-[#ff4d2d] text-white flex items-center justify-center font-semibold cursor-pointer"
                        onClick={() => setShowInfo((prev) => !prev)}
                    >
                        {userData?.fullname?.slice(0, 1)}
                    </div>
                )}

                {showInfo && userData && (
                    <div className="absolute right-0 top-12 w-44 bg-white shadow-xl rounded-xl p-4 flex flex-col gap-2">
                        <div className="font-semibold">{userData.fullname}</div>

                        <div className="text-[#ff4d2d] font-medium cursor-pointer">
                            My Orders
                        </div>

                        <div className="text-[#ff4d2d] font-medium cursor-pointer" onClick={handleLogOut}>
                            Log Out
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default NavbarDeliveryBoy