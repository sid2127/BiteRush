import React from 'react'
import { useSelector } from 'react-redux'
import UserDashboard from '../Components/UserDashboard';
import OwnerDashboard from '../Components/OwnerDashboard';
import DeliveryBoyDashboard from '../Components/DeliveryBoyDashboard';

function Home() {
    const userData = useSelector((state) => state.user.userInfo)
    const role = userData?.role;

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