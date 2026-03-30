import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    order: []
}

const orderSlice = createSlice({
    name: "order",
    initialState,
    reducers: {
        setAllOrders: (state, action) => {
            state.order = Array.isArray(action.payload)
            ? action.payload
            : [];
        },
        updateStatus: (state, action) => {
    const { orderId, shopId, status } = action.payload;

    state.order = state.order.map(order => {
        if (String(order._id) !== String(orderId)) return order;

        return {
            ...order,
            shops: order.shops.map(shop => {
                const currentShopId = shop.shop?._id || shop.shop;

                if (String(currentShopId) === String(shopId)) {
                    return { ...shop, status };
                }

                return shop;
            })
        };
    });
},
        addOrder: (state, action) => {
            if (!Array.isArray(state.order)) {
              state.order = [];
            }

             state.order.unshift(action.payload);
}
    }
})

export const { setAllOrders, updateStatus , addOrder } = orderSlice.actions;
export default orderSlice.reducer;
