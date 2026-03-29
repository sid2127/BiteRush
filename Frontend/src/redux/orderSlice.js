import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    order: []
}

const orderSlice = createSlice({
    name: "order",
    initialState,
    reducers: {
        setAllOrders: (state, action) => {
            state.order = action.payload;
        },
        updateStatus: (state, action) => {
            const { orderId, shopId, status } = action.payload;

            state.order.forEach((order, index) => {
                if (order._id === orderId) {
                    order.shops.forEach((shop, index) => {
                        if (shop.shop._id === shopId) {
                            shop.status = status;
                        }
                    })
                }
            })
        },
        addOrder: (state, action) => {
            state.order.unshift(action.payload);
        }

    }
})

export const { setAllOrders, updateStatus , addOrder } = orderSlice.actions;
export default orderSlice.reducer;