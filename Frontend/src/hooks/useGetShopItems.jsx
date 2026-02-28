import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setItems } from "../redux/shopSlice";

function useGetShopItems() {
  const dispatch = useDispatch();
  const shopId = useSelector((state) => state.shop.shopDetails?._id);
  const items = useSelector((state) => state.shop.items);

  useEffect(() => {
    if (!shopId) return; // ⛔ wait until shopId exists

    if (items.length > 0) {
      console.log("🛑 Items already in Redux, skipping fetch");
      return;
    }

    const fetchItems = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/v1/item/getItemsByShop/${shopId}`,
          { withCredentials: true }
        );

        console.log(res);
        
        dispatch(setItems(res.data.data.items));
      } catch (error) {
        console.error("Error fetching shop items", error);
      }
    };

    fetchItems();
  }, [shopId, dispatch]);
}

export default useGetShopItems;
