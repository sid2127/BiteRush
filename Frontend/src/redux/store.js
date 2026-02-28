import {configureStore} from '@reduxjs/toolkit';
import userSlice from './userSlice.js'
import shopSlice from './shopSlice.js'
import mapSlice from './mapSlice.js'
import orderSlice from './orderSlice.js'

export const store = configureStore({
    reducer: {
        user: userSlice,
        shop: shopSlice,
        map: mapSlice,
        order: orderSlice
    }
})