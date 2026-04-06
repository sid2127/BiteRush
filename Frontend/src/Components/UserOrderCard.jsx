import React from "react";
import axios from "axios";

function OwnerOrderCard({ order, shopId }) {

  // ✅ Update order status
  const handleUpdate = async (orderId, status) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_SERVER_URL}/api/v1/order/update-status/${orderId}`,
        { status }
      );

      console.log(res.data);
      alert("Order status updated successfully!");
      window.location.reload();

    } catch (error) {
      console.error(error);
      alert("Failed to update order status");
    }
  };

  if (!order) return null;

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4 mb-4">

      {/* 🔝 Header */}
      <div className="flex justify-between border-b pb-2">
        <div>
          <p className="font-semibold">Order #{order?._id}</p>
          <p className="text-sm text-gray-500">
            {new Date(order?.createdAt).toLocaleString()}
          </p>
        </div>

        <p className="font-medium text-blue-600">
          {order?.status}
        </p>
      </div>

      {/* 🛒 Items */}
      <div className="space-y-2">
        {order?.items?.map((itemWrapper, index) => {
          const item = itemWrapper?.item;

          if (!item) return null;

          return (
            <div key={index} className="flex justify-between text-sm">
              <span>{item?.name}</span>
              <span>
                {itemWrapper?.quantity} × ₹{item?.price}
              </span>
            </div>
          );
        })}
      </div>

      {/* 🔽 Total */}
      <div className="flex justify-between border-t pt-2 font-semibold">
        <span>Total</span>
        <span>₹{order?.totalAmount}</span>
      </div>

      {/* 🚀 Actions */}
      <div className="flex gap-2">

        <button
          className="bg-yellow-500 text-white px-3 py-1 rounded"
          onClick={() => handleUpdate(order._id, "Preparing")}
        >
          Accept
        </button>

        <button
          className="bg-blue-500 text-white px-3 py-1 rounded"
          onClick={() => handleUpdate(order._id, "Out for Delivery")}
        >
          Dispatch
        </button>

        <button
          className="bg-green-600 text-white px-3 py-1 rounded"
          onClick={() => handleUpdate(order._id, "Delivered")}
        >
          Delivered
        </button>

      </div>

    </div>
  );
}

export default OwnerOrderCard;