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
    if (!socket || !user) return;

    const newOrderhandler = (data) => {
      if (data?.shops?.[0]?.shop?.owner?._id === user._id) {
        dispatch(addOrder(data)); // ✅ correct
      }
    };

    const statusUpdatehandler = (data) => {
      if (orders && orders.length > 0) {
        dispatch(updateStatus({ orderId: data.id, shopId: data.shops[0].shop?._id || data.shops[0].shop, status: data.shops[0].status }))
      }
    }

    socket.on("newOrder", newOrderhandler);
    socket.on("orderStatusUpdated", statusUpdatehandler);

    return () => {
      socket.off("newOrder", newOrderhandler);
      socket.off("orderStatusUpdated", statusUpdatehandler)
    };

  }, [user, socket]);



  return (
    <div className='"w-full min-h-screen bg-[#fff9f6] flex justify-center px-4'>
      <div className='w-full max-w-200 p-4'>

        <div className='flex items-center gap-5 mb-6 '>
          <div className=' z-10 ' onClick={() => navigate("/")}>
            <IoIosArrowRoundBack size={35} className='text-[#ff4d2d]' />
          </div>
          <h1 className='text-2xl font-bold  text-start'>My Orders</h1>
        </div>
        {!orders && orders.length === 0 &&
          <div className='h-full flex items-center justify-center text-5xl font-extrabold'>
            No Orders Found
          </div>
        }
        {orders && orders.length > 0 &&
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
}
      </div>
    </div>
  )
}

export default Orders;