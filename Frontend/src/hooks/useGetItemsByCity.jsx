import axios from 'axios'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import { currentCity, currentState, ItemsInCity } from '../redux/userSlice';

function useGetItemsByCity() {

    const dispatch = useDispatch();

    const city = useSelector(state => state.user?.currentCity)
    const state = useSelector(state => state.user?.currentState);
    const shops = useSelector(state => state.user?.shopsInCity)
    const user = useSelector(state => state.user?.userInfo);



    useEffect(() => {
        if (!user || !user.location || !user.location.coordinates[0]) return;
        if(user){

        async function getItems() {
            try {
                const latitude = user?.location?.coordinates?.[1];
                const longitude = user?.location?.coordinates?.[0];

                const result = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/v1/item/getItemsByCity/${latitude}/${longitude}`,
                    { withCredentials: true }
                )

                console.log(result);
                dispatch(ItemsInCity(result.data.data));

            } catch (error) {
                console.log("Error in fetching items in city", error);
            }
        }

        getItems();
    }}, [ user, user?.location?.coordinates[0]])
}

export default useGetItemsByCity