import React, { useEffect, useState } from 'react';
import NavbarDeliveryBoy from './NavbarDeliveryBoy';
import { useSelector } from 'react-redux';
import axios from 'axios';
import DeliveryBoyTracking from './DeliveryBoyTracking';
import { useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import { socket } from '../../socket';

function DeliveryBoyDashboard() {

    const user = useSelector(state => state.user.userInfo);

    const [orders, setAllOrders] = useState([]);
    const [myCurrentOrder, setMyCurrentOrder] = useState(null);
    const [markDelivered, setMarkDelivered] = useState(false);
    const [otp, setOtp] = useState();



    const navigate = useNavigate();

    useEffect(() => {
        if (!myCurrentOrder) return;

        let lastSent = 0;

        const watchId = navigator.geolocation.watchPosition((pos) => {
            console.log("LIVE LOCATION:", pos.coords);
            const now = Date.now();

            if (now - lastSent > 3000) {
                lastSent = now;

                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;

                // ✅ update UI
                setMyCurrentOrder((prev) => {
                    if (!prev) return prev;

                    return {
                        ...prev,
                        deliveryOrder: {
                            ...prev.deliveryOrder,
                            assignedTo: {
                                ...prev.deliveryOrder.assignedTo,
                                location: {
                                    ...prev.deliveryOrder.assignedTo.location,
                                    coordinates: [lng, lat]
                                }
                            }
                        }
                    };
                });

                // ✅ emit socket
                socket.emit("deliveryLocationUpdate", {
                    deliveryBoy: myCurrentOrder.deliveryOrder.assignedTo._id,
                    customer: myCurrentOrder.deliveryOrder.order.user._id,
                    lat,
                    lng
                });
            }
        });

        return () => {
            navigator.geolocation.clearWatch(watchId);
        };

    }, [myCurrentOrder?._id]); // ✅ IMPORTANT FIX


    // ✅ Get current order
    const GetCurrentlyAssignedOrder = async () => {
        try {
            const result = await axios.get(
                `${import.meta.env.VITE_SERVER_URL}/api/v1/order/getCurrentOrder`,
                { withCredentials: true }
            );

            console.log("Current Order:", result.data);
            setMyCurrentOrder(result.data.data);

        } catch (error) {
            console.log("Error in current order", error);
        }
    };

    // ✅ Accept order (FIXED axios)
    const AcceptOrder = async (assignmentId) => {
        try {
            const result = await axios.put(
                `${import.meta.env.VITE_SERVER_URL}/api/v1/order/accept-Order/${assignmentId}`,
                {},
                { withCredentials: true }
            );

            console.log("Accepted order", result);

            // ✅ remove from broadcast list
            setAllOrders((prev) =>
                prev.filter((o) => o.assignmentId !== assignmentId)
            );

            // ✅ fetch current order
            await GetCurrentlyAssignedOrder();

        } catch (error) {
            console.log("Error in accepting order", error);
        }
    };

    // ✅ Generate OTP
    const GenerateOrderOtp = async () => {
        try {
            setMarkDelivered(true);

            const orderId =
                myCurrentOrder?.deliveryOrder?.order?._id ||
                myCurrentOrder?.deliveryOrder?.order;

            const shopId =
                myCurrentOrder?.deliveryOrder?.order?.shops?.[0]?.shop?._id ||
                myCurrentOrder?.deliveryOrder?.order?.shops?.[0]?.shop;

            if (!orderId || !shopId) {
                console.log("Missing orderId or shopId");
                return;
            }

            const result = await axios.get(
                `${import.meta.env.VITE_SERVER_URL}/api/v1/order/generateOtp/${orderId}/${shopId}`,
                { withCredentials: true }
            );

            console.log("OTP Generated:", result);

        } catch (error) {
            console.log("Error in generating otp", error);
        }
    };
    //Check Otp

    const CheckOtp = async () => {
        try {
            const orderId =
                myCurrentOrder?.deliveryOrder?.order?._id ||
                myCurrentOrder?.deliveryOrder?.order;

            const shopId =
                myCurrentOrder?.deliveryOrder?.order?.shops?.[0]?.shop?._id ||
                myCurrentOrder?.deliveryOrder?.order?.shops?.[0]?.shop;

            if (!orderId || !shopId || !otp) {
                console.log("Missing data for OTP verification");
                return;
            }

            const result = await axios.get(
                `${import.meta.env.VITE_SERVER_URL}/api/v1/order/validateOtp/${orderId}/${shopId}/${otp}`,
                { withCredentials: true }
            );

            console.log("OTP verified:", result);

            navigate("/");

        } catch (error) {
            console.log("Error in Verifying otp", error);
        }
    };

    // ✅ Get all broadcasted orders
    const getAllBroadCastedOrders = async () => {
        try {
            const result = await axios.get(
                `${import.meta.env.VITE_SERVER_URL}/api/v1/order/getAllBroadCastedOrders`,
                { withCredentials: true }
            );

            console.log("All Broadcasted Order:", result.data);

            // ⚠️ adjust based on backend
            setAllOrders(result.data.data || []);

        } catch (error) {
            console.log("Error fetching orders", error);
        }
    };

    // ✅ Load data
    useEffect(() => {
        if (user) {
            getAllBroadCastedOrders();
            GetCurrentlyAssignedOrder();
        }

    }, [user]);

    useEffect(() => {
        if (!user) return;

        const newBroadCastedOrder = (data) => {
            setAllOrders((prev) => [data, ...prev]);
        };

        socket.on("broadcasted-Orders", newBroadCastedOrder);

        return () => {
            socket.off("broadcasted-Orders", newBroadCastedOrder);
        };
    }, [user]);



    return (
        <>
            <header>
                <NavbarDeliveryBoy />
            </header>

            <section className='flex flex-col items-center mt-10 space-y-6'>

                {/* USER INFO */}
                <div className='bg-white shadow rounded-lg p-6 w-full max-w-md text-center'>
                    <div className='mb-4 font-bold text-orange-400'>
                        Welcome {user?.fullname}
                    </div>
                    <div>latitude : {user?.location?.coordinates?.[1]}</div>
                    <div>longitude: {user?.location?.coordinates?.[0]}</div>
                </div>

                {/* 🔥 FIXED CONDITION */}
                {!myCurrentOrder?.deliveryOrder && (
                    <div className='max-w-md mx-auto mt-10 space-y-4'>

                        <h2 className='text-xl font-bold'>Available Orders</h2>

                        {orders.length > 0 ? (
                            orders.map((o, index) => (
                                <div
                                    key={index}
                                    className='bg-white rounded-xl shadow-md p-4 flex justify-between items-center'
                                >
                                    <div className='space-y-1'>
                                        <h3 className='font-semibold text-gray-800'>
                                            Order ID: <span>{o.order}</span>
                                        </h3>

                                        <p>{o.shop}</p>

                                        <p className='text-xs'>
                                            📍 Shop: {o.shopAddress}
                                        </p>

                                        <p className='text-xs'>
                                            🏠 {o.deliveryAddress?.text}
                                        </p>
                                    </div>

                                    <button
                                        className='bg-amber-500 text-white px-4 py-2 rounded'
                                        onClick={() => AcceptOrder(o.assignmentId)}
                                    >
                                        Accept
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className='text-gray-500'>
                                No Orders Available
                            </div>
                        )}
                    </div>
                )}

                {/* CURRENT ORDER */}
                {myCurrentOrder?.deliveryOrder && (
                    <div className='w-full max-w-3xl bg-white shadow rounded-lg p-6 space-y-4'>

                        <h1 className='text-2xl font-bold'>Current Order</h1>

                        <div>
                            <h1>
                                Shop: {myCurrentOrder?.deliveryOrder?.shop?.name}
                            </h1>

                            <div>
                                {myCurrentOrder?.deliveryOrder?.order?.user?.fullname}
                            </div>

                            <div>
                                {myCurrentOrder?.deliveryOrder?.order?.deliveryAddress?.text}
                            </div>

                            <div>
                                <span className='mr-2.5'>lat : {myCurrentOrder?.deliveryOrder?.order?.deliveryAddress?.latitude}</span>
                                <span>lon: {myCurrentOrder?.deliveryOrder?.order?.deliveryAddress?.longitude}</span>
                            </div>

                            <div>
                                Items: {myCurrentOrder?.items?.length || 0} |
                                ₹{myCurrentOrder?.totalAmount}
                            </div>
                        </div>

                        {/* MAP */}
                        <div className='w-full h-96 border rounded-lg'>
                            <DeliveryBoyTracking data={myCurrentOrder} />
                        </div>

                        {/* BUTTON */}
                        <button
                            className='w-full bg-green-500 text-white py-2 rounded'
                            onClick={GenerateOrderOtp}
                        >
                            Mark As Delivered
                        </button>

                        {/* OTP INPUT */}
                        {markDelivered && (
                            <div>
                                <input
                                    type="text"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className='w-full border p-2'
                                />

                                <div className="flex justify-center mt-2">
                                    <button className='bg-amber-500 text-white px-4 py-2 rounded' onClick={() => CheckOtp()}>
                                        Submit
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                )}
            </section>
        </>
    );
}

export default DeliveryBoyDashboard;