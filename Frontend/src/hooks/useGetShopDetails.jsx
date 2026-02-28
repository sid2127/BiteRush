import { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { setShopDetails } from "../redux/shopSlice";

function useGetShopDetail() {
  const dispatch = useDispatch();

  const shopDetails = useSelector(state => state.shop.shopDetails)

  useEffect(() => {
    
    if(shopDetails){
      console.log("Shop Details already present in redux");
      
      return;
    }
    const checkShop = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/v1/shop/get-shop`,
          { withCredentials: true }
        );

        console.log(res.data.data)
        dispatch(setShopDetails(res.data.data))
        
        
      } catch {
          dispatch(setShopDetails(null))
      }
    };

    checkShop();
  }, []);
}

export default useGetShopDetail;
