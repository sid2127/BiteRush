import React, { useEffect, useState } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaUtensils } from "react-icons/fa";
import axios from 'axios';
import { setShopDetails } from '../redux/shopSlice'
import { ClipLoader } from 'react-spinners';

function CreateEditShop() {

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const { myShopData } = useSelector(state => state.shop)
    const user = useSelector(state => state.user.userInfo)

    // ✅ lat/lon
    const lat = user?.location?.coordinates?.[1];
    const lon = user?.location?.coordinates?.[0];

    // 🔥 auto address
    const [autoAddress, setAutoAddress] = useState({
        city: "",
        state: "",
        address: ""
    });

    const [name, setName] = useState(myShopData?.name || "")
    const [frontendImage, setFrontendImage] = useState(myShopData?.shopImage || null)
    const [backendImage, setBackendImage] = useState(null)
    const [loading, setLoading] = useState(false)

    // 🔁 reverse geocode
    useEffect(() => {
        if (!lat || !lon) return;

        const fetchAddress = async () => {
            try {
                const res = await axios.get(
                    "https://api.geoapify.com/v1/geocode/reverse",
                    {
                        params: {
                            lat,
                            lon,
                            format: "json",
                            apiKey: import.meta.env.VITE_GEOLOCATION_API_KEY
                        }
                    }
                );

                if (!res.data.results || res.data.results.length === 0) return;

                const result = res.data.results[0];

                const city =
                    result.city ||
                    result.town ||
                    result.village ||
                    result.county ||
                    result.state_district ||
                    "";

                setAutoAddress({
                    city,
                    state: result.state || "",
                    address: result.formatted || ""
                });

            } catch (error) {
                console.log(error);
            }
        };

        fetchAddress();

    }, [lat, lon]);

    // ✅ final values
    const city = myShopData?.city || autoAddress.city;
    const state = myShopData?.state || autoAddress.state;
    const address = myShopData?.address || autoAddress.address;

    const handleImage = (e) => {
        const file = e.target.files[0]
        setBackendImage(file)
        setFrontendImage(URL.createObjectURL(file))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const formData = new FormData()
            formData.append("name", name)
            formData.append("city", city)
            formData.append("state", state)
            formData.append("address", address)

            if (backendImage) {
                formData.append("image", backendImage)
            }

            const result = await axios.post(
                `${import.meta.env.VITE_SERVER_URL}/api/v1/shop/create-edit`,
                formData,
                { withCredentials: true }
            )

            dispatch(setShopDetails(result.data.data))
            navigate("/")

        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='flex justify-center flex-col items-center p-6 bg-linear-to-br from-orange-50 relative to-white min-h-screen'>

            <div className='absolute top-5 left-5 z-10 mb-2.5' onClick={() => navigate("/")}>
                <IoIosArrowRoundBack size={35} className='text-[#ff4d2d]' />
            </div>

            <div className='max-w-lg w-full bg-white shadow-xl rounded-2xl p-8 border border-orange-100'>

                <div className='flex flex-col items-center mb-6'>
                    <div className='bg-orange-100 p-4 rounded-full mb-4'>
                        <FaUtensils className='text-[#ff4d2d] w-16 h-16' />
                    </div>
                    <div className="text-3xl font-extrabold text-gray-900">
                        {myShopData ? "Edit Shop" : "Add Shop"}
                    </div>
                </div>

                <form className='space-y-5' onSubmit={handleSubmit}>

                    {/* NAME */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Name</label>
                        <input
                            type="text"
                            className='w-full px-4 py-2 border rounded-lg'
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    {/* IMAGE */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Shop Image</label>
                        <input type="file" accept='image/*' onChange={handleImage} />
                        {frontendImage && (
                            <div className='mt-4'>
                                <img src={frontendImage} className='w-full h-48 object-cover rounded-lg border' />
                            </div>
                        )}
                    </div>

                    {/* CITY + STATE */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                            <label className='text-sm font-medium'>City</label>
                            <input
                                type="text"
                                value={city || "Fetching..."}
                                readOnly
                                className='w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed'
                            />
                        </div>

                        <div>
                            <label className='text-sm font-medium'>State</label>
                            <input
                                type="text"
                                value={state || "Fetching..."}
                                readOnly
                                className='w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed'
                            />
                        </div>
                    </div>

                    {/* ADDRESS */}
                    <div>
                        <label className='text-sm font-medium'>Address</label>
                        <input
                            type="text"
                            value={address || "Fetching..."}
                            readOnly
                            className='w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed'
                        />
                    </div>

                    {/* BUTTON */}
                    <button className='w-full bg-[#ff4d2d] text-white py-3 rounded-lg' disabled={loading}>
                        {loading ? <ClipLoader size={20} color='white' /> : "Save"}
                    </button>

                </form>
            </div>
        </div>
    )
}

export default CreateEditShop