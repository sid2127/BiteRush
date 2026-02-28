import React, { useState } from 'react'
import { FaLeaf } from "react-icons/fa";
import { FaDrumstickBite } from "react-icons/fa";
import { FaStar } from "react-icons/fa";
import { FaRegStar } from "react-icons/fa6";
import { FaMinus } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { FaShoppingCart } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { AddToCart } from '../redux/userSlice';

function ItemCard({ data }) {

    const dispatch = useDispatch();
    const [count, setCount] = useState(0);

    const handleIncrease = () => {
        const qnt = count + 1;
        setCount(qnt);
    }

    const handleDecrease = () => {
        if (count >= 1) {
            const qnt = count - 1;
            setCount(qnt);
        }
    }

    const renderStars = (rating) => {   //r=3
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                (i <= rating) ? (
                    <FaStar className='text-yellow-500 text-lg' />
                ) : (
                    <FaRegStar className='text-yellow-500 text-lg' />
                )
            )

        }
        return stars
    }

    return (
        <div className='w-62.5 rounded-2xl border-2 border-[#ff4d2d] bg-white shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col'>
            <div className='relative w-full h-42.5 flex justify-center items-center bg-white'>
                <div className='absolute top-3 right-3 bg-white rounded-full p-1 shadow'>{data.foodType == "veg" ? <FaLeaf className='text-green-600 text-lg' /> : <FaDrumstickBite className='text-red-600 text-lg' />}</div>


                <img src={data.imageUrl} alt="" className='w-full h-full object-cover transition-transform duration-300 hover:scale-105' />
            </div>

            <div className="flex-1 flex flex-col p-4">
                <h1 className='font-semibold text-gray-900 text-base truncate'>{data.name}</h1>

                <div className='flex items-center gap-1 mt-1'>
                    {renderStars(data.rating?.average || 0)}
                    <span className='text-xs text-gray-500'>
                        {data.rating?.count || 0}
                    </span>
                </div>
            </div>

            <div className='flex items-center justify-between mt-auto p-3'>
                <span className='font-bold text-gray-900 text-lg'>
                    ₹{data.price}
                </span>

            </div>

            <div className='flex items-center border rounded-full overflow-hidden shadow-sm'>
                <button className='px-2 py-1 hover:bg-gray-100 transition' onClick={handleDecrease}>
                    <FaMinus size={12} />
                </button>
                <span>{count}</span>
                <button className='px-2 py-1 hover:bg-gray-100 transition' onClick={handleIncrease}>
                    <FaPlus size={12} />
                </button>
                <button onClick={() => dispatch(AddToCart({
                    itemId: data._id,
                    name: data.name,
                    price: data.price,
                    quantity: count,
                    imageUrl: data.imageUrl,
                    category: data.category
                }))}>
                    <FaShoppingCart size={16} />
                </button>

            </div>
        </div>
    )
}

export default ItemCard