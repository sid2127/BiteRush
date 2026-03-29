import { createSlice } from "@reduxjs/toolkit";
import { auth } from "../../firebase";

const initialState = {
    userInfo: null,
    currentCity: null,
    currentState: null,
    currentAddress: null,
    shopsInCity: null,
    itemsInCity: null,
    Cart: [],
    totalAmount: 0,
    searchItems: [],
    socket: null,
    loading : true
}

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUserData: (state, action) => {
            state.userInfo = action.payload
        },
        currentCity: (state, action) => {
            state.currentCity = action.payload;
        },
        currentState: (state, action) => {
            state.currentState = action.payload;
        },
        currentAddress: (state, action) => {
            state.currentAddress = action.payload;
        },
        ShopsIncity: (state, action) => {
            state.shopsInCity = action.payload;
        },
        ItemsInCity: (state, action) => {
            state.itemsInCity = action.payload
        },
        AddToCart: (state, action) => {
            const item = action.payload;

            if (state.Cart.some(i => i.itemId === item.itemId)) {
                const it = state.Cart.find(i => i.itemId === item.itemId);
                it.quantity = item.quantity;
                state.totalAmount += it.quantity * it.price;
            }
            else {
                state.Cart.push(item);
                state.totalAmount += item.quantity * item.price;
            }

        },
        UpdateQuantity: (state, action) => {
            const item = action.payload;
            const it = state.Cart.find(i => i.itemId === item.itemId);
            state.totalAmount -= it.price * it.quantity;
            it.quantity = item.quantity;

            state.totalAmount += it.price * it.quantity;
        },
        DeleteItem: (state, action) => {
            const itemId = action.payload;

            const item = state.Cart.find(ele => ele.itemId === itemId)
            if (!item) return;

            state.totalAmount -= item.price * item.quantity;

            state.Cart = state.Cart.filter(ele => ele.itemId !== itemId);
        },
        SetSearchItem: (state , action) => {
            state.searchItems = action.payload
        },
        SetSocketId: (state, action) => {
            state.socket = action.payload;
        },
        SetLoading : (state , action)=> {
            state.loading = action.payload
        }

    }
})

export const { setUserData, currentCity, currentState, currentAddress, ShopsIncity, ItemsInCity, AddToCart, UpdateQuantity, DeleteItem, SetSearchItem , SetSocketId , SetLoading} = userSlice.actions;

export default userSlice.reducer
