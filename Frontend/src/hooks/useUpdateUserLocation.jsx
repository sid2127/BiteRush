import axios from "axios";
import { useEffect } from "react";

function useUpdateLocation() {
    useEffect(() => {
        const updateAddress = async (lat, lon) => {
            try {
                const result = await axios.post(
                    `${import.meta.env.VITE_SERVER_URL}/api/v1/auth/updateLocation`,
                    { lat, lon },
                    { withCredentials: true }
                );

                console.log(result.data);
            } catch (error) {
                console.log("Error while updating location:", error.response?.data || error.message);
            }
        };

        navigator.geolocation.watchPosition((pos) => {
            updateAddress(pos.coords.latitude, pos.coords.longitude);
        });
    }, []);
}

export default useUpdateLocation;