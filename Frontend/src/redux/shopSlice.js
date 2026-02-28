import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    shopDetails: null,
    items: []
}

const shopSlice = createSlice({
    name: "shop",
    initialState,
    reducers: {
        setShopDetails: (state, action) => {
            state.shopDetails = action.payload
        },
        setItems: (state, action) => {
            state.items = action.payload
        },
        removeItem: (state, action) => {
            state.items = state.items.filter(
                item => item._id !== action.payload
            );
        },
        updateItem: (state, action) => {
            const updatedItem = action.payload;

            state.items = state.items.map(item =>
                item._id === updatedItem._id ? updatedItem : item
            );
        }

    }
})


export const { setShopDetails, setItems, removeItem, updateItem } = shopSlice.actions;
export default shopSlice.reducer;