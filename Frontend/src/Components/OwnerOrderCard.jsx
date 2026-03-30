import React from 'react'
import { MdPhone } from "react-icons/md";
import axios from 'axios'
import { useDispatch } from 'react-redux';
import { updateStatus } from '../redux/orderSlice';
import { useState } from 'react';

function OwnerOrderCard({ order }) {

  const [availableBoys , setAvailableBoys] = useState([]);

  const dispatch = useDispatch();


  const handleUpdate = async(shopId , status)=> {
    try {
      const result = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/v1/order/updateStatus/${order._id}/${shopId}`,
        {status},
        {withCredentials: true}
      )

      console.log(result);
      dispatch(updateStatus(order._id , shopId , status));
      setAvailableBoys(result.data.data.deliveryBoysPayload);
      
    } catch (error) {
      console.log(`Error on Change status ${error}`);
    }
  }

  return (
    <div className='bg-white rounded-lg shadow p-4 space-y-4'>
      <div>
        <h2 className='text-lg font-semibold text-gray-800'>{order.user.fullname}</h2>
        <p className='text-sm text-gray-500'>{order.user.email}</p>
        <p className='flex items-center gap-2 text-sm text-gray-600 mt-1'><MdPhone /><span>{order.user.mobile}</span></p>
      </div>

      <div className=' text-gray-600 text-sm'>
        <p>{order.deliveryAddress.text}</p>
        <p className='text-xs text-gray-500 mt-2.5'>Lat: {order.deliveryAddress.latitude} , Lon {order.deliveryAddress.longitude}</p>
      </div>

      <div className='flex space-x-3 overflow-x-auto pb-2'>
        {order.shops[0].items.map((itemm , index) => (
          <div key={index}>
            <img src={itemm.item.imageUrl} alt="" className='h-24'/>
            <p>{itemm.item.name}</p>
            <p>{`₹${itemm.item.price} × ${itemm.quantity}`}</p>
          </div>
        ))}
      </div>

      <div className='flex justify-between'>
        <p>Status : {order.shops[0].status}</p>
        <span>
          <p className='mb-2.5'>Change Status : </p>
        <select className='pl-3 border-black shadow' onChange={(e) => handleUpdate(order.shops[0].shop._id , e.target.value)}>
          <option value="">Change</option>
          <option value="pending">Pending</option>
          <option value="Preparing">Preparing</option>
          <option value="Out for Delivery">Out for Delivery</option>
        </select>
        </span>
      </div>

      <div>
        Total : ₹{order.shops[0].subTotal}
      </div>

      <div className=' bg-white rounded-lg shadow p-4 h-16 '>
          <div className='font-bold'>Available Delivery Boys</div>
          {availableBoys &&
            availableBoys.map((boy , index) => (
              <span>{boy.fullname} : {boy.mobile}</span>
            ))
          }
        </div>
      </div>
  )
}

export default OwnerOrderCard