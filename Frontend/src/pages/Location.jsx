import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

function RecenterMap({ lat, lon }) {
    const map = useMap();

    if (lat && lon) {
        map.setView([lat, lon], 16, { animate: true });
    }

    return null;
}

function SelectLocation() {

    // ✅ Separate states
    const [lat, setLat] = useState(28.6139);   // default Delhi
    const [lon, setLon] = useState(77.2090);
    const [addressInput, setAddressInput] = useState("");
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    // ✅ AUTO LOCATION ON PAGE LOAD
    useEffect(() => {
        if (!navigator.geolocation) {
            console.log("Geolocation not supported");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const latitude = pos.coords.latitude;
                const longitude = pos.coords.longitude;

                setLat(latitude);
                setLon(longitude);

                await getAddress(latitude, longitude);
                setLoading(false);
            },
            (error) => {
                console.log("Permission denied or error:", error.message);

                // ❌ If denied → fallback Delhi (already set)
                setLoading(false);
            }
        );
    }, []);

    // 🔁 Reverse Geocoding
    const getAddress = async (latitude, longitude) => {
        try {
            const res = await axios.get(
                "https://api.geoapify.com/v1/geocode/reverse",
                {
                    params: {
                        lat: latitude,
                        lon: longitude,
                        format: "json",
                        apiKey: import.meta.env.VITE_GEOLOCATION_API_KEY
                    }
                }
            );

            const addr = res.data.results[0]?.formatted;
            setAddressInput(addr || "");
        } catch (err) {
            console.log(err);
        }
    };

    // 🔎 Search Location
    const searchLocation = async () => {
        try {
            const res = await axios.get(
                "https://api.geoapify.com/v1/geocode/search",
                {
                    params: {
                        text: addressInput,
                        format: "json",
                        apiKey: import.meta.env.VITE_GEOLOCATION_API_KEY
                    }
                }
            );

            console.log(res);

            if (!res.data.results || res.data.results.length === 0) {
                alert("Location not found ❌. Try a more accurate address.");
                return;
            }


            const latitude = res.data.results[0].lat;
            const longitude = res.data.results[0].lon;

            setLat(latitude);
            setLon(longitude);
        } catch (err) {
            console.log(err);
        }
    };

    // 📍 Manual GPS Button
    const getCurrentLocation = () => {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const latitude = pos.coords.latitude;
            const longitude = pos.coords.longitude;

            setLat(latitude);
            setLon(longitude);

            await getAddress(latitude, longitude);
        });
    };

    // 📌 Drag Marker
    const onDragEnd = (e) => {
        const { lat: latitude, lng: longitude } = e.target._latlng;

        setLat(latitude);
        setLon(longitude);

        getAddress(latitude, longitude);
    };

    // ✅ Save Location
    const handleSaveLocation = async () => {
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_SERVER_URL}/api/v1/auth/updateLocation`,
                {
                    lat: lat,
                    lon: lon
                },
                { withCredentials: true }
            );

            console.log(res.data.data);
            

            dispatch(setUserData(res.data.data))

            navigate('/');

            alert("Location Saved ✅");
        } catch (error) {
            console.log(error);
        }

    };

    if (loading) {
        return <div className="h-screen flex items-center justify-center">Loading map...</div>;
    }

    return (
        <div className="h-screen flex flex-col p-4 gap-3 bg-white">

            <h1 className="text-xl font-bold">Select Your Location</h1>

            {/* 🔎 Search */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    placeholder="Enter your location..."
                    className="flex-1 border p-2 rounded-lg"
                />

                <button
                    onClick={searchLocation}
                    className="bg-orange-500 text-white px-4 rounded-lg"
                >
                    Search
                </button>

                <button
                    onClick={getCurrentLocation}
                    className="bg-blue-500 text-white px-4 rounded-lg"
                >
                    GPS
                </button>
            </div>

            {/* 🗺️ Map */}
            <div className="flex-1 rounded-xl overflow-hidden border">
                <MapContainer
                    center={[lat, lon]}
                    zoom={16}
                    className="w-full h-full"
                >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    <Marker
                        position={[lat, lon]}
                        draggable={true}
                        eventHandlers={{ dragend: onDragEnd }}
                    />

                    <RecenterMap lat={lat} lon={lon} />
                </MapContainer>
            </div>

            {/* ✅ Button */}
            <button
                onClick={handleSaveLocation}
                className="bg-green-600 text-white py-3 rounded-xl font-semibold"
            >
                Confirm Location
            </button>
        </div>
    );
}

export default SelectLocation;