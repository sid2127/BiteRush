import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import SignUp from './pages/Signup'
import Login from './pages/Login'
import Home from './pages/Home'
import useGetCurrentUser from './hooks/useGetCurrentUser'
import useGetLocation from './hooks/useGetLocation'
import useGetShopDetails from './hooks/useGetShopDetails'
import CreateEdit from './pages/CreateEdit'
import AddItems from './pages/AddItems'
import EditItems from './pages/EditItems'
import useGetShopsByCity from './hooks/useGetShopsByCity'
import useGetItemsByCity from './hooks/useGetItemsByCity'
import CartPage from './pages/CartPage'
import Checkout from './pages/Checkout'
import useGetAllOrders from './hooks/useGetAllOrders'
import Orders from './pages/Orders'
import OrderComplete from './pages/OrderComplete'



function App() {

  useGetCurrentUser();
  useGetLocation();


  const userData = useSelector(state => state.user.userInfo);
  const shopData = useSelector(state => state.shop.shopDetails)
  const item = useSelector(state => state.shop.items)
  const city = useSelector(state => state.user.currentCity)
  const state = useSelector(state => state.user.currentState);

    useGetShopsByCity();
    useGetItemsByCity();
    useGetAllOrders();

  return (
    <Routes>
      <Route
        path="/login"
        element={!userData ? <Login /> : <Navigate to="/" />}
      />
      <Route
        path="/signup"
        element={!userData ? <SignUp /> : <Navigate to="/" />}
      />
      <Route
        path="/"
        element={userData ? <Home /> : <Navigate to="/login" />}
      />
      <Route path='/create-edit' element={userData ? <CreateEdit/>: <Navigate to= "/login"/>} />
      <Route path='/add-item' element={shopData ? <AddItems /> : <Navigate to= "/" />} />
      <Route path='/edit-item/:itemId' element={item ? <EditItems /> : <Navigate to= "/" />}  />
      <Route path='/Cart' element={userData? <CartPage /> : <Navigate to={"/login"} />}  />
      <Route path='/checkout' element={userData? <Checkout /> : <Navigate to={"/login"} />}  />
      <Route path='/order-complete' element={userData? <OrderComplete /> : <Navigate to={"/login"} />}/>  
      <Route path='/my-orders' element={userData? <Orders /> : <Navigate to={"/login"} />} />
    </Routes>
  )
}

export default App
