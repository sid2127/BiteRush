import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

function useGetCurrentUser() {
  const dispatch = useDispatch();

  useEffect(() => {
    
    const checkUser = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/v1/auth/getCurrentUser`,
          { withCredentials: true }
        );

        console.log(res);
        

        dispatch(setUserData(res.data.data));
        
      } catch {
        dispatch(setUserData(null));
      }
    };

    checkUser();
  }, []);
}

export default useGetCurrentUser;
