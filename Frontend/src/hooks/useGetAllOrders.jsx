import axios from 'axios'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import { setAllOrders } from '../redux/orderSlice';


function useGetAllOrders() {

    const dispatch = useDispatch();
    const user = useSelector(state => state.user.userInfo);
    const orders = useSelector(state => state.user.order);
    
    useEffect(()=> {
        if(!user){
            return;
        }
        if(orders){
           return; 
        }
        async function getAllOrders(){
            try {
                const result = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/v1/order/getAllOrders`,
                    {withCredentials: true}
                )
    
                console.log(result);
                dispatch(setAllOrders(result.data.data))
                

            } catch (error) {
                console.log("Error in fetching shops in city" , error);
            }
        }

        getAllOrders();
    },[user ])
}

export default useGetAllOrders;