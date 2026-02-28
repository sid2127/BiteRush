import React from 'react'
import { useSelector } from 'react-redux'
import UserOrderCard from '../Components/UserOrderCard';
import OwnerDashboard from '../Components/OwnerDashboard';

function Orders() {

  const orders = useSelector(state => state.order.order);
  const user = useSelector(state => state.user.userInfo)

  return (
    <div className='flex flex-col justify-center items-center'>
      {orders.map((order , index) => (
        user.role === "user" ? 
        <UserOrderCard key={index} order={order} /> : 
        user.role === "owner" ?
        <OwnerDashboard order={order} key={index} />:
        null
      ))}
    </div>
  )
}

export default Orders