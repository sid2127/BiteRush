import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import axios from 'axios';
import { currentAddress, currentCity, currentState } from '../redux/userSlice';
import { setAddress, setLocation } from '../redux/mapSlice';

function useGetLocation() {

   const dispatch = useDispatch();



   useEffect(() => {
      navigator.geolocation.getCurrentPosition(async (position) => {
         // console.log(position);

         const result = await axios.get(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json&apiKey=${import.meta.env.VITE_GEOLOCATION_API_KEY}`
         )

         dispatch(setLocation({lat: position.coords.latitude , lon: position.coords.longitude}));
         dispatch(setAddress(result.data.results[0].address_line1 + result.data.results[0].address_line2))
         console.log(result);

         // console.log(result.data.results[0].address_line2);
         // console.log(result.data.results[0].city);
         // console.log(result.data.results[0].address_line1 + result.data.results[0].address_line2);
         dispatch(currentCity(result.data.results[0].city))
         dispatch(currentState(result.data.results[0].state))
         dispatch(currentAddress(result.data.results[0].address_line1 + result.data.results[0].address_line2))

      })
   })
}

export default useGetLocation