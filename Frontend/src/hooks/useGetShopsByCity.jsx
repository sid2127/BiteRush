import axios from 'axios'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import { ShopsIncity } from '../redux/userSlice';

function useGetShopsByCity() {

    const dispatch = useDispatch();

    const city = useSelector(state => state.user.currentCity)
    const state = useSelector(state => state.user.currentState);
    const shops = useSelector(state => state.user.shopsInCity)
    const user = useSelector(state => state.user.userInfo);
    
    useEffect(()=> {
        if (!user) return;
        if(!city || !state){
            return;
        }
        async function getShops(){
            try {
                const result = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/v1/shop/getShopByCity/${city}/${state}`,
                    {withCredentials: true}
                )
    
                console.log(result);
                dispatch(ShopsIncity(result.data.data));

            } catch (error) {
                console.log("Error in fetching shops in city" , error);
            }
        }

        getShops();
    }, [user, city , state])
}

export default useGetShopsByCity