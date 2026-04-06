import { asynchandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Item } from '../models/item.model.js'
import { Order } from '../models/Order.model.js';
import User from '../models/user.model.js'
import { Shop } from "../models/shop.model.js";
import { DeliveryAssignment } from "../models/deliveryAssignment.js";
import { sentOtp } from "../utils/mail.js";
import Razorpay from "razorpay";


const getRazorpayInstance = () => {
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
};

//Create Order
const CreateOrder = asynchandler(async (req, res) => {
    const { cartItems, deliveryAddress, paymentMethod } = req.body;

    if (!cartItems || cartItems.length === 0) {
        throw new ApiError(400, "Cart is empty");
    }

    if (!deliveryAddress || !paymentMethod) {
        throw new ApiError(400, "Missing data");
    }

    let totalAmount = 0;
    const shops = {};

    for (const item of cartItems) {
        const dbItem = await Item.findById(item.itemId).populate("itemOwner");

        if (!dbItem) throw new ApiError(404, "Item not found");

        const subTotal = dbItem.price * item.quantity;
        totalAmount += subTotal;

        const shopId = dbItem.itemOwner._id;

        if (!shops[shopId]) {
            shops[shopId] = {
                shop: shopId,
                items: [],
                subTotal: 0
            };
        }

        shops[shopId].items.push({
            item: dbItem._id,
            quantity: item.quantity,
            price: dbItem.price
        });

        shops[shopId].subTotal += subTotal;
    }

    const shopArray = Object.values(shops);

    // 💵 Online
    if (paymentMethod === "Online") {

        const instance = getRazorpayInstance();

        const razorOrder = await instance.orders.create({
            amount: totalAmount * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        });

        const order = await Order.create({
            user: req.user._id,
            shops: shopArray,
            totalAmount,
            deliveryAddress,
            paymentMethod,
            razorpayOrderId: razorOrder.id,
            orderStatus: "pending",
            payment: false
        });

        return res.json({
            success: true,
            data: {
                razorOrder,
                orderId: order._id
            }
        });
    }


    const order = await Order.create({
        user: req.user._id,
        shops: shopArray,
        totalAmount,
        deliveryAddress,
        paymentMethod,
        orderStatus: "placed",
        payment: false
    })

    const populatedOrder = await Order.findById(order._id)
        .populate("user", "fullname")
        .populate({
            path: "shops.shop",
            populate: {
                path: "owner",
                select: "fullname mobile email socketId"
            }
        })
        .populate("shops.items.item", "name price foodType imageUrl");

    const io = req.app.get('io');

    if (io) {
        populatedOrder.shops.forEach((s => {

            const OwnerSocketId = s.shop.owner.socketId;
            if (OwnerSocketId) {
                io.to(OwnerSocketId).emit('newOrder', {
                    id: order._id,
                    paymentMethod: order.paymentMethod,
                    user: order.user,
                    shops: [s],
                    createdAt: order.createdAt,
                    deliveryAddress: order.deliveryAddress,
                    totalAmount: s.subTotal
                })

            }
        }))

    }

    return res.json({
        success: true,
        data: order
    });
});

//VerifyPayment

import crypto from "crypto";

const VerifyPayment = asynchandler(async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        orderId
    } = req.body;

    if (!razorpay_payment_id || !orderId) {
        throw new ApiError(400, "Missing payment data");
    }

    // 🔐 Signature verification
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

    if (expectedSignature !== razorpay_signature) {
        throw new ApiError(400, "Invalid signature");
    }

    const order = await Order.findById(orderId);
    if (!order) throw new ApiError(404, "Order not found");

    const instance = getRazorpayInstance();

    const payment = await instance.payments.fetch(razorpay_payment_id);

    if (!payment || payment.status !== "captured") {
        order.orderStatus = "failed";
        await order.save();
        throw new ApiError(400, "Payment failed");
    }

    order.payment = true;
    order.orderStatus = "placed";
    order.razorpayPaymentId = razorpay_payment_id;

    await order.save();

    return res.json({
        success: true,
        message: "Payment successful",
        data: order
    });
});

//getAll Order of user/shop

const GetAllOrder = asynchandler(async (req, res) => {
    console.log("GetAllOrder API HIT");
    const user = req.user._id;

    if (!user) {
        throw new ApiError(400, "No user found");
    }

    const findUser = await User.findById(user);

    if (!findUser) {
        throw new ApiError(400, "No user exists");
    }

    if (findUser.role === "User") {
        const orders = await Order.find({ user: user })
            .sort({ createdAt: -1 })
            .populate("user", "fullname")
            .populate("shops.shop")
            .populate("shops.items.item", "name price foodType imageUrl")

        if (orders.length == 0) {
            return res.status(200).json(
                new ApiResponse(200,
                    [],
                    "No Orders present"
                )
            )
        }

        return res.status(200).json(
            new ApiResponse(200,
                orders,
                "Orders fetched sucessfully of customer"
            )
        )
    }

    if (findUser.role === "Owner") {
        const isshop = await Shop.findOne({ owner: user });

        if (!isshop) {
            throw new ApiError(404, "Shop not found for this owner");
        }

        const orders = await Order.find({
            "shops.shop": isshop._id,
            $or: [
                { paymentMethod: "Cod" },
                { paymentMethod: "Online", payment: true }
            ]
        })
            .sort({ createdAt: -1 })
            .populate("user", "fullname email mobile")
            .populate("shops.shop")
            .populate("shops.items.item", "name price foodType imageUrl")


        const filteredOrders = orders.map((order => ({
            _id: order._id,
            paymentMethod: order.paymentMethod,
            user: order.user,
            shops: order.shops.filter(o => o.shop._id.equals(isshop._id)),
            createdAt: order.createdAt,
            deliveryAddress: order.deliveryAddress,
            totalAmount: order.totalAmount
        })))

        if (orders.length == 0) {
            return res.status(200).json(
                new ApiResponse(200,
                    [],
                    "No Orders present"
                )
            )
        }

        return res.status(200).json(
            new ApiResponse(200,
                filteredOrders,
                "Orders fetched sucessfully Of Owner"
            )
        )
    }
})

//Change status 

const ChangeStatus = asynchandler(async (req, res) => {
    const { orderId, shopId } = req.params;
    const { status } = req.body;

    if (!status) {
        throw new ApiError(400, "No status provided");
    }

    if (!orderId || !shopId) {
    throw new ApiError(400, "orderId or shopId missing");
}

    const order = await Order.findById(orderId);

    if (!order) {
        throw new ApiError(404, "No such order found");
    }

    const shopIndex = order.shops.findIndex(
        (shopItem) => shopItem.shop.toString() === shopId
    );

    if (shopIndex === -1) {
        throw new ApiError(400, "Shop Not Found");
    }

    order.shops[shopIndex].status = status;

    let deliveryBoysPayload = [];

    let deliveryAssignments = null;

    if (order.shops[shopIndex].deliveryAssignment) {
        deliveryAssignments = await DeliveryAssignment.findById(
            order.shops[shopIndex].deliveryAssignment
        );
    }

    if (status === "Out for Delivery" && (!order.shops[shopIndex].deliveryAssignment || !deliveryAssignments)) {

        if (!deliveryAssignments) {
            order.shops[shopIndex].deliveryAssignment = null;
        }

        const { latitude, longitude } = order.deliveryAddress;

        const nearByDeliveryBoys = await User.find({
            role: "Delivery Boy",
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [Number(longitude), Number(latitude)]
                    },
                    $maxDistance: 10000
                }
            }
        });

        const nearByIds = nearByDeliveryBoys.map((boy) => boy._id);

        const busyBoys = await DeliveryAssignment.find({
            assignedTo: { $in: nearByIds },
            status: "Assigned"
        });

        const busyboysId = new Set(
            busyBoys.map((b) => String(b.assignedTo))
        );

        const availableBoys = nearByDeliveryBoys.filter(
            (b) => !busyboysId.has(String(b._id))
        );

        if (availableBoys.length === 0) {
            await order.save();

            return res.status(200).json(
                new ApiResponse(
                    200,
                    order,
                    "Status updated, but all nearby delivery boys are busy or no delivery boy available"
                )
            );
        }

        const deliveryAssignment = await DeliveryAssignment.create({
            order: order._id,
            shop: shopId,
            broadCastedTo: availableBoys.map((b) => b._id),
            status: "BroadCasted",
        });

        order.shops[shopIndex].deliveryAssignment = deliveryAssignment._id;
        order.shops[shopIndex].deliveryBoy = null;

        deliveryBoysPayload = availableBoys.map((b) => ({
            id: b._id,
            fullname: b.fullname,
            mobile: b.mobile,
            lon: b.location.coordinates[0],
            lat: b.location.coordinates[1]
        }));

        await order.save();

        await order.populate("user", "fullname email mobile socketId");
        await order.populate("shops.shop");
        await order.populate("shops.items.item", "name price foodType imageUrl");

        const io = req.app.get('io');

        if (io) {
            availableBoys.forEach(async (b) => {

                const userSocketId = await User.findById(b._id);

                if (userSocketId) {
                    io.to(userSocketId.socketId).emit("broadcasted-Orders", {
                        assignmentId: deliveryAssignment._id,
                        order: order._id,
                        shop: order.shops[shopIndex].shop.name,
                        shopAddress: order.shops[shopIndex].shop.address,
                        items: order.shops[shopIndex].items || [],
                        subTotal: order.shops[shopIndex].subTotal || 0,
                        deliveryAddress: order.deliveryAddress
                    })
                }
            })
        }

        const deliveryBoy = order.shops[shopIndex].deliveryBoy;

        return res.status(200).json(
            new ApiResponse(
                200,
                { order, deliveryBoysPayload, deliveryBoy },
                "Successfully updated status"
            )
        );
    }

    await order.save();

    await order.populate("user", "fullname email mobile socketId");
    await order.populate("shops.shop");
    await order.populate("shops.items.item", "name price foodType imageUrl");

    const io = req.app.get('io');

    if (io) {
        const userSocketId = order.user.socketId;

        if (userSocketId) {
            io.to(userSocketId).emit("orderStatusUpdated", {
                id: order._id,
                paymentMethod: order.paymentMethod,
                user: order.user,
                shops: [order.shops[shopIndex]],
                createdAt: order.createdAt,
                deliveryAddress: order.deliveryAddress,
                totalAmount: order.shops[shopIndex].subTotal
            })
        }

    }

    const deliveryBoy = order.shops[shopIndex].deliveryBoy;

    return res.status(200).json(
        new ApiResponse(
            200,
            { order, deliveryBoysPayload, deliveryBoy },
            "Successfully updated status"
        )
    );
});

//Get All Broadcasted Orders To DeliveryBoy

const GetAllBroadCastedOrders = asynchandler(async (req, res) => {

    const allBroadCastedOrder = await DeliveryAssignment.find({
        broadCastedTo: req.user._id,
        status: "BroadCasted"
    })
        .populate({
            path: "order",
            populate: {
                path: "shops.shop"
            }
        })
        .populate("shop");

    if (allBroadCastedOrder.length === 0) {
        return res.status(200).json(
            new ApiResponse(
                200,
                [],
                "No Orders Available right now in this area"
            )
        );
    }

    const deliveryAssignments = allBroadCastedOrder.map((d) => {

        const shopData = d.order.shops.find(
            (s) => s.shop._id.toString() === d.shop._id.toString()
        );

        return {
            assignmentId: d._id,
            order: d.order._id,
            shop: d.shop.name,
            shopAddress: d.shop.address,
            items: shopData?.items || [],
            subTotal: shopData?.subTotal || 0,
            deliveryAddress: d.order.deliveryAddress
        };
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            deliveryAssignments,
            "Successfully fetched all broadcasted orders in this region"
        )
    );
});

//Accept Order By Delivery Boy

const AcceptOrder = asynchandler(async (req, res) => {
    const { orderId } = req.params;

    if (!orderId) {
        throw new ApiError(400, "No orderId is in params")
    }

    // Step 1: Atomic update (race-safe)
    const assignment = await DeliveryAssignment.findOneAndUpdate(
        {
            _id: orderId,
            status: "BroadCasted"
        },
        {
            assignedTo: req.user._id,
            status: "Assigned",
            orderAcceptedDate: new Date()
        },
        { new: true }
    );

    if (!assignment) {
        throw new ApiError(400, "Order already taken by another delivery boy");
    }

    // Step 2: Update Order
    const order = await Order.findById(assignment.order);

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    const shopIndex = order.shops.findIndex(
        (s) => s.shop.toString() === assignment.shop.toString()
    );

    if (shopIndex === -1) {
        throw new ApiError(400, "Shop not found in order");
    }

    order.shops[shopIndex].deliveryBoy = req.user._id;
    order.shops[shopIndex].deliveryAssignment = assignment._id;

    await order.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            assignment,
            "Order assigned successfully"
        )
    );
});

//Get Current Order 

const GetCurrentlyAssignOrder = asynchandler(async (req, res) => {

    const deliveryOrder = await DeliveryAssignment.findOne({
        assignedTo: req.user._id,
        status: "Assigned"
    }).populate("shop", "name address")
        .populate({
            path: "order",
            select: "user deliveryAddress paymentMethod shops",
            populate: {
                path: "user",
                select: "fullname"
            }
        })
        .populate("assignedTo", "fullname location");

    if (!deliveryOrder) {
        return res.status(200)
            .json(
                new ApiResponse(200,
                    "No order is assigned"
                )
            )
    }

    const shopItemIndex = deliveryOrder.order.shops.findIndex((s) => s.shop.toString() === deliveryOrder.shop._id.toString());

    if (shopItemIndex == -1) {
        throw new ApiError(400, "No order found")
    }

    const items = deliveryOrder.order.shops[shopItemIndex].items;
    const totalAmount = deliveryOrder.order.shops[shopItemIndex].subTotal;

    return res.status(200)
        .json(
            new ApiResponse(200,
                { deliveryOrder, items, totalAmount },
                "Order fetch sucessfully"
            )
        )


})


//Get Order By Id 

const GetOrderById = asynchandler(async (req, res) => {
    const { orderId, shopId } = req.params;

    if (!orderId) {
        throw new ApiError(400, "No orderId is send in params")
    }

    const order = await Order.findById(orderId)
        .populate("user", "fullname")
        .populate("shops.shop", "name address")
        .populate("shops.items.item", "name")
        .populate("shops.deliveryBoy", "fullname location")
        .populate("shops.deliveryAssignment");

    if (!order) {
        throw new ApiError(400, "No order found")
    }

    const shopIndex = order.shops.findIndex((s) => s.shop._id.toString() === shopId.toString());

    if (shopIndex == -1) {
        throw new ApiError(400, "No order found with this shopId")
    }

    const orderDetails = {
        id: order._id,
        user: order.user,
        shop: order.shops[shopIndex].shop,
        items: order.shops[shopIndex].items,
        deliveryBoy: order.shops[shopIndex].deliveryBoy,
        deliveryAddress: order.deliveryAddress,
        total: order.totalAmount
    }

    return res.status(200)
        .json(
            new ApiResponse(200,
                orderDetails,
                "Order Fetched Suceesfully"
            )
        )
})

//Generate Otp

const GenerateOtp = asynchandler(async (req, res) => {
    const { orderId, shopId } = req.params;

    if (!orderId || !shopId) {
        throw new ApiError(400, "No orderId or shopId is there")
    }

    const order = await Order.findById(orderId).populate("user", "email orderOtp otpExpires");

    if (!order) {
        throw new ApiError(400, "No order is there")
    }

    const shopOrder = order.shops.find((s) => s.shop.toString() === shopId.toString());

    if (!shopOrder) {
        throw new ApiError(400, "shopId is  not there")
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const time = Date.now() + 10 * 60 * 1000;

    order.user.orderOtp = otp;
    order.user.otpExpires = time;

    await order.user.save();
    await sentOtp(order.user.email, otp)

    return res.status(200).json(
        new ApiResponse(200, null, "Otp Sent Successfully")
    );
})

//VerifyOtp

const VerifyOrderOtp = asynchandler(async (req, res) => {
    const { orderId, shopId, Otp } = req.params;

    // ✅ Validate input
    if (!Otp || !orderId || !shopId) {
        throw new ApiError(400, "OrderId, ShopId or OTP missing");
    }

    const order = await Order.findById(orderId)
        .populate("user", "orderOtp otpExpires");

    if (!order) {
        throw new ApiError(400, "No order found");
    }

    // ✅ OTP + Expiry check
    if (
        order.user.orderOtp !== Otp ||
        order.user.otpExpires < Date.now()
    ) {
        throw new ApiError(400, "OTP is incorrect or expired");
    }

    // ✅ Find shop
    const shopItem = order.shops.find(
        (s) => s.shop.toString() === shopId.toString()
    );

    if (!shopItem) {
        throw new ApiError(400, "Shop not found");
    }

    // ✅ Update order status
    shopItem.status = "Delivered";
    shopItem.deliveryAssignment = null;

    // ✅ Delete assignment
    await DeliveryAssignment.findOneAndDelete({
        order: orderId,
        shop: shopItem.shop
    });

    // ✅ Clear OTP after success (VERY IMPORTANT)
    order.user.orderOtp = null;
    order.user.otpExpires = null;

    await order.user.save();
    await order.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Order Delivered Successfully"
        )
    );
});

export { CreateOrder, GetAllOrder, ChangeStatus, GetAllBroadCastedOrders, AcceptOrder, GetCurrentlyAssignOrder, GetOrderById, GenerateOtp, VerifyOrderOtp, VerifyPayment };