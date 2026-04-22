
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    shops: [{
        shop: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Shop',
            required: true
        },

        items: [{
            item: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Item',
                required: true
            },
            quantity: Number,
            price: Number
        }],

        subTotal: Number,

        status: {
            type: String,
            enum: ['Pending', 'Preparing', 'Out for Delivery', 'Delivered'],
            default: 'Pending'
        },

        deliveryAssignment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DeliveryAssignment"
        },

        deliveryBoy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },


    }],

    totalAmount: Number,

    deliveryAddress: {
        text: String,
        latitude: Number,
        longitude: Number,
    },

    paymentMethod: {
        type: String,
        enum: ['Cod', 'Online'],
        required: true
    },

    orderStatus: {
        type: String,
        enum: ["pending", "paid", "failed", "placed"],
        default: "pending"
    },
    payment: {
        type: Boolean,
        default: false
    },
    razorpayOrderId: {
        type: String,
        default: ""
    },
    razorpayPaymentId: {
        type: String,
        default: ""
    }

}, { timestamps: true });

// orderSchema.index({ user: 1, createdAt: -1 });


export const Order = mongoose.model("Order", orderSchema);
