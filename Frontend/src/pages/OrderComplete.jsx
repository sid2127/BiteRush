import axios from 'axios';
import React from 'react'
import { FaCircleCheck } from "react-icons/fa6";
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {  setAllOrders } from '../redux/orderSlice';
import { serverUrl } from '../App';
function OrderPlaced() {
    const navigate=useNavigate();
    const dispatch = useDispatch();

    const handleOrders = async()=>{
      const orders = await axios.get(`${serverUrl}/api/v1/order/getAllOrders`,
      {withCredentials:true});

      console.log("Orders" , orders);
      
      dispatch(setAllOrders(orders.data.data));
      navigate("/my-orders");
    }
  return (
    <div className='min-h-screen bg-[#fff9f6] flex flex-col justify-center items-center px-4 text-center relative overflow-hidden'>
      <FaCircleCheck className='text-green-500 text-6xl mb-4'/>
      <h1 className='text-3xl font-bold text-gray-800 mb-2'>Order Placed!
      </h1>
      <p className='text-gray-600 max-w-md mb-6'>Thank you for your purchase. Your order is being prepared.  
        You can track your order status in the "My Orders" section.
     </p>
     <button className='bg-[#ff4d2d] hover:bg-[#e64526] text-white px-6 py-3 rounded-lg text-lg font-medium transition' onClick={handleOrders}>Back to my orders</button>
    </div>
  )
}

export default OrderPlaced

