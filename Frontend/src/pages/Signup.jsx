import React from 'react'
import { useState } from 'react';
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from 'react-router-dom';
import axios from "axios"
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase.js';
import { ClipLoader } from "react-spinners"
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice.js';

function SignUp() {
    const primaryColor = "#ff4d2d";
    const bgColor = "#fff9f6";
    const borderColor = "#ddd";

    const [showPassword, setShowPassword] = useState(false)
    const [role, setRole] = useState("User")
    const navigate = useNavigate()

    const [fullname, setfullname] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [mobile, setMobile] = useState("")

    // ✅ NEW ADDRESS STATES
    const [addressLine1, setAddressLine1] = useState("")
    const [addressLine2, setAddressLine2] = useState("")
    const [city, setCity] = useState("")
    const [state, setState] = useState("")
    const [pincode, setPincode] = useState("")

    const [err, setErr] = useState("")
    const [loading, setLoading] = useState(false);

    const dispatch = useDispatch();

    const handleSignUp = async () => {
        setLoading(true)
        try {
            const result = await axios.post(
                `${import.meta.env.VITE_SERVER_URL}/api/v1/auth/signup`,
                {
                    fullname,
                    email,
                    password,
                    mobile,
                    role,
                    // ✅ SEND ADDRESS OBJECT
                    address: {
                        addressLine1,
                        addressLine2,
                        city,
                        state,
                        pincode
                    }
                },
                { withCredentials: true }
            )

            if (result.data) {
                dispatch(setUserData(result.data.data.user));
            }

            setErr("")
            setLoading(false)

        } catch (error) {
            setErr(error?.response?.data?.message)
            setLoading(false)
        }
    }

    const handleGoogleAuth = async () => {
        if (!mobile) {
            setErr("Mobile number is required");
            return;
        }

        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const data = await axios.post(
                `${import.meta.env.VITE_SERVER_URL}/api/v1/auth/googleAuth`,
                {
                    fullname: user.displayName || "Google User",
                    email: user.email,
                    role,
                    mobile,
                    // ✅ ADD HERE ALSO
                    address: {
                        addressLine1,
                        addressLine2,
                        city,
                        state,
                        pincode
                    }
                },
                { withCredentials: true }
            );

            dispatch(setUserData(data.data.data.user));

        } catch (error) {
            const message = error.response?.data?.message || error.message;
            setErr(message);
        }
    };

    return (
        <div className='min-h-screen w-full flex items-center justify-center p-4' style={{ backgroundColor: bgColor }}>
            <div className='bg-white rounded-xl shadow-lg w-full max-w-md p-8 border'
                style={{ border: `1px solid ${borderColor}` }}>

                <h1 className='text-3xl font-bold mb-2' style={{ color: primaryColor }}>Vingo</h1>
                <p className='text-gray-600 mb-8'>Create your account</p>

                {/* Fullname */}
                <div className='mb-4'>
                    <label className='block text-gray-700 font-medium mb-1'>Full Name</label>
                    <input type="text" className='w-full border rounded-lg px-3 py-2'
                        onChange={(e) => setfullname(e.target.value)} value={fullname} />
                </div>

                {/* Email */}
                <div className='mb-4'>
                    <label className='block text-gray-700 font-medium mb-1'>Email</label>
                    <input type="email" className='w-full border rounded-lg px-3 py-2'
                        onChange={(e) => setEmail(e.target.value)} value={email} />
                </div>

                {/* Mobile */}
                <div className='mb-4'>
                    <label className='block text-gray-700 font-medium mb-1'>Mobile</label>
                    <input type="text" className='w-full border rounded-lg px-3 py-2'
                        onChange={(e) => setMobile(e.target.value)} value={mobile} />
                </div>

                {/* Password */}
                <div className='mb-4'>
                    <label className='block text-gray-700 font-medium mb-1'>Password</label>
                    <div className='relative'>
                        <input type={showPassword ? "text" : "password"}
                            className='w-full border rounded-lg px-3 py-2 pr-10'
                            onChange={(e) => setPassword(e.target.value)} value={password} />
                        <button type="button"
                            className='absolute right-3 top-3 text-gray-500'
                            onClick={() => setShowPassword(prev => !prev)}>
                            {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                        </button>
                    </div>
                </div>

                {/* ✅ ADDRESS FIELDS */}

                <div className='mb-4'>
                    <label className='block text-gray-700'>Address Line 1</label>
                    <input className='w-full border rounded-lg px-3 py-2'
                        onChange={(e) => setAddressLine1(e.target.value)} value={addressLine1} />
                </div>

                <div className='mb-4'>
                    <label className='block text-gray-700'>Address Line 2</label>
                    <input className='w-full border rounded-lg px-3 py-2'
                        onChange={(e) => setAddressLine2(e.target.value)} value={addressLine2} />
                </div>

                <div className='mb-4'>
                    <label className='block text-gray-700'>City</label>
                    <input className='w-full border rounded-lg px-3 py-2'
                        onChange={(e) => setCity(e.target.value)} value={city} />
                </div>

                <div className='mb-4'>
                    <label className='block text-gray-700'>State</label>
                    <input className='w-full border rounded-lg px-3 py-2'
                        onChange={(e) => setState(e.target.value)} value={state} />
                </div>

                <div className='mb-4'>
                    <label className='block text-gray-700'>Pincode</label>
                    <input type="number" className='w-full border rounded-lg px-3 py-2'
                        onChange={(e) => setPincode(e.target.value)} value={pincode} />
                </div>

                {/* Role */}
                <div className='mb-4 flex gap-2'>
                    {["User", "Owner", "Delivery Boy"].map((r) => (
                        <button key={r}
                            className='flex-1 border rounded-lg px-3 py-2'
                            onClick={() => setRole(r)}
                            style={role === r
                                ? { backgroundColor: primaryColor, color: "white" }
                                : { border: `1px solid ${primaryColor}`, color: primaryColor }}>
                            {r}
                        </button>
                    ))}
                </div>

                <button className='w-full py-2 bg-[#ff4d2d] text-white rounded-lg'
                    onClick={handleSignUp} disabled={loading}>
                    {loading ? <ClipLoader size={20} color='white' /> : "Sign Up"}
                </button>

                {err && <p className='text-red-500 text-center mt-2'>{err}</p>}

                <button className='w-full mt-4 flex items-center justify-center gap-2 border rounded-lg px-4 py-2'
                    onClick={handleGoogleAuth}>
                    <FcGoogle />
                    Sign up with Google
                </button>

                <p className='text-center mt-6 cursor-pointer' onClick={() => navigate("/login")}>
                    Already have an account? <span className='text-[#ff4d2d]'>Sign In</span>
                </p>
            </div>
        </div>
    )
}

export default SignUp