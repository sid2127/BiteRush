import mongoose from 'mongoose';

const deliveryAssignmentSchema = mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order"
    },
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop"
    },
    broadCastedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User" 
    },
    status: {
        type: String,
        enum: ["BroadCasted" , "Assigned" , "Completed"]
    },
    orderAcceptedDate : {
        type: Date
    }
}, {timestamps: true})


export const DeliveryAssignment = mongoose.model("DeliveryAssignment" , deliveryAssignmentSchema);