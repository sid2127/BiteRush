import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { currentAddress, currentCity, currentState } from "../redux/userSlice";
import { setAddress, setLocation } from "../redux/mapSlice";

function useGetLocation() {

  const dispatch = useDispatch();
  const { lat, lon } = useSelector((state) => state.map.location);
  const user = useSelector((state)=> state.user.userInfo)

  useEffect(() => {

    const getAddress = async (latitude, longitude) => {
      try {

        const result = await axios.get(
          `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${import.meta.env.VITE_GEOLOCATION_API_KEY}`
        );

        console.log(result);
        
        const address =
          result.data.results[0].address_line1 +
          result.data.results[0].address_line2;

        dispatch(setLocation({ lat: latitude, lon: longitude }));
        dispatch(setAddress(address));
        dispatch(currentCity(result.data.results[0].city));
        dispatch(currentState(result.data.results[0].state));
        dispatch(currentAddress(address));

      } catch (error) {
        console.log("Location fetch error", error);
      }
    };

    navigator.geolocation.getCurrentPosition(

      // user allowed location
      async (position) => {

        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        await getAddress(latitude, longitude);

      },

      // user denied location
      async () => {

        // fallback to default redux location
        await getAddress(lat, lon);

      }

    );

  }, [lat , lon, user]);

}

export default useGetLocation;