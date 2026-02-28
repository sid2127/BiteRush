import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    order: []
}

const orderSlice = createSlice({
    name: "order",
    initialState,
    reducers: {
        setAllOrders: (state , action)=> {
            state.order = action.payload;
        },
    }
})

export const {setAllOrders} = orderSlice.actions;
export default orderSlice.reducer;