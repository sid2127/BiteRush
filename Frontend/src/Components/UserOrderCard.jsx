import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar } from "react-icons/fa";
import axios from 'axios';
import { useSelector } from 'react-redux';

function UserOrderCard({ order }) {

  const navigate = useNavigate();

<<<<<<< HEAD
=======
  const user = useSelector((state) => state.user.userInfo);

  // ⭐ store rating per item
>>>>>>> recovery-code
  const [ratings, setRatings] = useState({});
  const [hover, setHover] = useState({});

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  // ⭐ handle rating click
  const handleRatingClick = (itemId, value) => {
    if (!itemId) return;   // ✅ safety
    setRatings(prev => ({
      ...prev,
      [itemId]: value
    }));
  };

  // 📤 submit rating
  const handleSubmit = async (itemId) => {
    if (!itemId) return;

    const rating = ratings[itemId];

    if (!rating) {
      alert("Please select a rating first");
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/v1/item/rating/${itemId}`,
        { rating }
      );

      console.log(res.data);
      alert("Rating submitted successfully!");
    } catch (err) {
      console.error(err);
      alert("Error submitting rating");
    }
  };

  if (!order) return null;

  return (
    <div className='bg-white rounded-lg shadow p-4 space-y-10 mb-4'>

      {/* 🔝 Order Header */}
      <div className='flex justify-between border-b pb-2'>
        <div>
          <p className='font-semibold'>Order #{order?._id || "N/A"}</p>
          <p className='text-sm text-gray-500'>
            Date: {formatDate(order?.createdAt)}
          </p>
        </div>

        <div className='text-right'>
          {order?.paymentMethod === "Cod" ? (
            <p className='text-sm text-gray-500'>
              {order?.paymentMethod?.toUpperCase()}
            </p>
          ) : (
            <p className='text-sm text-gray-500 font-semibold'>
              Payment: {order?.payment ? "true" : "false"}
            </p>
          )}
          <p className='font-medium text-blue-600'>
            {order?.shops?.[0]?.status || "N/A"}
          </p>
        </div>
      </div>

      {/* 🏪 Shop Orders */}
      {order?.shops?.map((shopOrder, shopIndex) => (
        <div key={shopIndex} className='border rounded-lg p-3 bg-[#fffaf7] space-y-3'>

          <p className='font-semibold'>
            {shopOrder?.shop?.name || "Shop removed"}
          </p>

          {/* 🛒 Items */}
          <div className='flex space-x-4 overflow-x-auto pb-2'>
            {shopOrder?.items?.map((itemWrapper, index) => {

              const item = itemWrapper?.item;

              // ✅ CRITICAL FIX (prevents crash)
              if (!item) return null;

              const itemId = item._id;

              return (
                <div key={index} className='shrink-0 bg-white rounded-lg p-2 w-40'>

                  <img
                    src={item?.imageUrl || "/placeholder.png"}
                    alt=""
                    className='w-full h-24 object-cover rounded'
                  />

                  <p className='text-sm font-semibold mt-1'>
                    {item?.name || "Item removed"}
                  </p>

                  <p className='text-xs text-gray-500'>
                    Qty: {itemWrapper?.quantity || 0} × ₹{item?.price || 0}
                  </p>

                  {/* ⭐ Rating Section */}
<<<<<<< HEAD
                  {shopOrder?.status === "Delivered" && (
=======
                  {shopOrder.status === "Delivered" &&(
>>>>>>> recovery-code
                    <div className='mt-2'>

                      <div className='flex gap-1 cursor-pointer'>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar
                            key={star}
                            size={20}
                            color={
                              star <= (hover[itemId] || ratings[itemId])
                                ? "gold"
                                : "lightgray"
                            }
                            onClick={() => handleRatingClick(itemId, star)}
                            onMouseEnter={() =>
                              setHover(prev => ({ ...prev, [itemId]: star }))
                            }
                            onMouseLeave={() =>
                              setHover(prev => ({ ...prev, [itemId]: 0 }))
                            }
                          />
                        ))}
                      </div>

                      <button
                        onClick={() => handleSubmit(itemId)}
                        className='mt-1 text-xs bg-black text-white px-2 py-1 rounded'
                      >
                        Submit
                      </button>

                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {/* 🔽 Shop Footer */}
          <div className='flex justify-between items-center border-t pt-2'>
            <p className='font-semibold'>
              Subtotal: ₹{shopOrder?.subTotal || 0}
            </p>

<<<<<<< HEAD
            <button
              className='bg-blue-500 text-white rounded-md shadow px-2 py-1'
              onClick={() =>
                navigate(`/track-order/${order?._id}/${shopOrder?.shop?._id}`)
              }
            >
              Track Order
            </button>
=======
            {shopOrder.status == "Out for Delivery"  && shopOrder.deliveryBoy != null &&(
              <button
                className='bg-blue-500 text-white rounded-md shadow px-2 py-1'
                onClick={() =>
                  navigate(`/track-order/${order._id}/${shopOrder.shop._id}`)
                }
              >
                Track Order
              </button>
            )}
>>>>>>> recovery-code
          </div>

        </div>
      ))}

      {/* 🔻 Total */}
      <div className='flex justify-between items-center border-t pt-2'>
        <p className='font-semibold'>
          Total: ₹{order?.totalAmount || 0}
        </p>
      </div>

    </div>
  );
}

export default UserOrderCard;
