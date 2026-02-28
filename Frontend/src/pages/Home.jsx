import React from 'react'
import { useSelector } from 'react-redux'
import UserDashboard from '../Components/UserDashboard';
import OwnerDashboard from '../Components/OwnerDashboard';

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
        <div>Delivery Boy</div>
    }
    </>
  )
}

export default Home;