import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import UserOrderCard from '../Components/UserOrderCard';
import { IoIosArrowRoundBack } from "react-icons/io";
import OwnerOrderCard from '../Components/OwnerOrderCard';
import { useEffect } from 'react';
import { addOrder, setAllOrders, updateStatus } from '../redux/orderSlice';
import { socket } from '../../socket';

function Orders() {

  const orders = useSelector(state => state.order.order);
  const user = useSelector(state => state.user.userInfo);

  const dispatch = useDispatch();

 useEffect(() => {
  if (!socket || !user?._id) return;

  const statusUpdatehandler = (data) => {
    console.log("🔥 SOCKET EVENT RECEIVED:", data);   // ✅ DEBUG

    const orderId = data?.id || data?._id;
    const shopId = data?.shops?.[0]?.shop?._id || data?.shops?.[0]?.shop;

    if (!orderId || !shopId) return;

    dispatch(updateStatus({
      orderId,
      shopId,
      status: data?.shops?.[0]?.status
    }));
  };

  socket.on("orderStatusUpdated", statusUpdatehandler);

  return () => {
    socket.off("orderStatusUpdated", statusUpdatehandler);
  };

}, [user?._id, socket, dispatch]);
  return (
    <div className='"w-full min-h-screen bg-[#fff9f6] flex justify-center px-4'>
      <div className='w-full max-w-200 p-4'>

        <div className='flex items-center gap-5 mb-6 '>
          <div className=' z-10 ' onClick={() => navigate("/")}>
            <IoIosArrowRoundBack size={35} className='text-[#ff4d2d]' />
          </div>
          <h1 className='text-2xl font-bold  text-start'>My Orders</h1>
        </div>
        <div className='space-y-24'>
          {Array.isArray(orders) && orders?.map((order, index) => (
            user.role == "User" ?
              (
                <UserOrderCard order={order} key={index} />
              )
              :
              user.role == "Owner" ? (
                <OwnerOrderCard order={order} key={index} />
              )
                :
                null
          ))}
        </div>
      </div>
    </div>
  )
}

export default Orders;
