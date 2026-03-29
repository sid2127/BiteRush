import { createSlice } from "@reduxjs/toolkit"
import { map } from "leaflet";

const initialState = {
    location: {
        lat: 29.157843,
        lon: 79.52660399999999,
    },
    address: "",
}

const mapSlice = createSlice({
    name: "map",
    initialState,
    reducers: {
        setLocation: (state, action)=> {
            const {lat , lon} = action.payload;
            state.location.lat = lat;
            state.location.lon = lon;
        },
        setAddress: (state , action) => {
            state.address = action.payload
        }
    }
})


export const {setLocation , setAddress} = mapSlice.actions;
export default mapSlice.reducer