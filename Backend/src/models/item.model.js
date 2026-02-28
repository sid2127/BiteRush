import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    category: {
        type: String,
        enum: ["Snacks",
            "Main Course",
            "Desserts",
            "Pizza",
            "Burgers",
            "Sandwiches",
            "South Indian",
            "North Indian",
            "Chinese",
            "Fast Food",
            "Others"
        ],
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    foodType: {
        type: String,
        enum: ["veg", "non veg"],
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    itemOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop'
    },
    rating: {
        average: {
            type: Number,
            default: 0
        },
        count: {
            type: Number,
            default: 0
        }
    }
}, { timestamps: true })

export const Item = mongoose.model('Item', itemSchema);