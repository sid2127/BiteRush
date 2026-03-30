import React from 'react'
import { useSelector } from 'react-redux'
import UserDashboard from '../Components/UserDashboard';
import OwnerDashboard from '../Components/OwnerDashboard';
import DeliveryBoyDashboard from '../Components/DeliveryBoyDashboard';
import useGetAllOrders from '../hooks/useGetAllOrders';


function Home() {
    const userData = useSelector((state) => state.user.userInfo)
    const role = userData?.role;

    useGetAllOrders();

  return (
    <>
    {role === "User" &&
       <UserDashboard />
    }
    {role === "Owner" &&
        <OwnerDashboard />
    }
    {
      role === "Delivery Boy" &&
        <DeliveryBoyDashboard />
    }
    </>
  )
}

export default Home;