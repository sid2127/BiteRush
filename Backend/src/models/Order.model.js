import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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
            quantity: {
                type: Number,
                required: true
            },
            price: {
                type: Number,
                required: true
            }
        }],

        subTotal: {
            type: Number,
            required: true
        },

        status: {
            type: String,
            enum: ['Pending', 'Preparing', 'Out for Delivery', 'Delivered'],
            default: 'Pending'
        }

    }],

    totalAmount: {
        type: Number,
        required: true
    },

    deliveryAddress: {
        text: String,
        latitude: Number,
        longitude: Number,
    },

    paymentMethod: {
        type: String,
        enum: ['Cod', 'Online'],
        required: true
    }

}, { timestamps: true });

export const Order =  mongoose.model("Order", orderSchema);
