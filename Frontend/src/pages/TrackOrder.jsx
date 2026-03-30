import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, Polyline } from 'react-leaflet';
import { useParams } from 'react-router-dom';
import scooter from '../assets/scooter.png';
import home from '../assets/home.png';
import L from 'leaflet';
import "leaflet/dist/leaflet.css";
import { socket } from '../../socket';

// ✅ Icons
const deliveryBoyIcon = new L.Icon({
    iconUrl: scooter,
    iconSize: [40, 40],
});

const customerIcon = new L.Icon({
    iconUrl: home,
    iconSize: [40, 40],
});

function TrackOrder() {

    const { orderId, shopId } = useParams();
    const [orderData, setOrderData] = useState(null);

    useEffect(() => {
        if (!socket) return;

        const handleLocationUpdate = (data) => {
            const { lat, lng } = data;

            console.log("LIVE LOCATION:", data);

            setOrderData((prev) => {
                if (!prev) return prev;

                return {
                    ...prev,
                    deliveryBoy: {
                        ...prev.deliveryBoy,
                        location: {
                            ...prev.deliveryBoy.location,
                            coordinates: [lng, lat] // ✅ correct
                        }
                    }
                };
            });
        };

        // ✅ listen
        socket.on("deliveryLocationUpdated", handleLocationUpdate);

        // ✅ cleanup
        return () => {
            socket.off("deliveryLocationUpdated", handleLocationUpdate);
        };
    }, []);

    // ✅ API CALL
    const GetOrderDetail = async () => {
        try {
            const result = await axios.get(
                `${import.meta.env.VITE_SERVER_URL}/api/v1/order/getOrderById/${orderId}/${shopId}`,
                { withCredentials: true }
            );

            console.log("Track order" , result);


            setOrderData(result.data.data);

        } catch (error) {
            console.log("Error in GetOrderDetail", error);
        }
    };

    useEffect(() => {
        GetOrderDetail();
    }, [orderId, shopId]);

    // ✅ Loading State
    if (!orderData) {
        return <div className="text-center mt-10">Loading...</div>;
    }

    // ✅ Coordinates
    const deliveryLat = orderData.deliveryBoy?.location?.coordinates?.[1];
    const deliveryLng = orderData.deliveryBoy?.location?.coordinates?.[0];

    const customerLat = orderData.deliveryAddress?.latitude;
    const customerLng = orderData.deliveryAddress?.longitude;

    const center = [customerLat, customerLng];

    return (
        <div className="flex flex-col items-center p-4 space-y-4">

            {/* ORDER DETAILS */}
            <div className='bg-white shadow rounded-lg w-full max-w-2xl p-4 border'>
                <h1 className='text-xl font-bold mb-2'>{orderData.shop?.name}</h1>

                <div className="mb-2">
                    <span className="font-semibold">Items: </span>
                    {orderData.items?.map((i, index) => (
                        <span key={index} className="mr-2">
                            {i.item?.name} × {i.quantity}
                        </span>
                    ))}
                </div>

                <div className="mb-2">
                    <span className="font-semibold">Subtotal: </span>
                    ₹{orderData.shop?.subTotal || 0}
                </div>

                <div>
                    <span className="font-semibold">Delivery Address: </span>
                    {orderData.deliveryAddress?.text}
                </div>
            </div>

            {/* MAP */}
            <div className="w-full max-w-3xl h-96 rounded-lg overflow-hidden border">
                <MapContainer
                    center={center}
                    zoom={16}
                    className="w-full h-full"
                >
                    <TileLayer
                        attribution='&copy; OpenStreetMap contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* 🚴 Delivery Boy */}
                    {deliveryLat && deliveryLng && (
                        <Marker
                            position={[deliveryLat, deliveryLng]}
                            icon={deliveryBoyIcon}
                        >
                            <Popup>Delivery Boy</Popup>
                        </Marker>
                    )}

                    {/* 🏠 Customer */}
                    <Marker
                        position={[customerLat, customerLng]}
                        icon={customerIcon}
                    >
                        <Popup>Customer Home</Popup>
                    </Marker>

                    {/* 📍 Route Line */}
                    {deliveryLat && deliveryLng && (
                        <Polyline
                            positions={[
                                [deliveryLat, deliveryLng],
                                [customerLat, customerLng]
                            ]}
                        />
                    )}

                </MapContainer>
            </div>
        </div>
    );
}

export default TrackOrder;