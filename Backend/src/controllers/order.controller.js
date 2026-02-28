import { asynchandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

import { ApiResponse } from "../utils/ApiResponse.js";
import { Item } from '../models/item.model.js'
import { Order } from '../models/Order.model.js';
import User from '../models/user.model.js'
import { Shop } from "../models/shop.model.js";

//Create Order
const CreateOrder = asynchandler(async (req, res) => {
    const { cartItems, deliveryAddress, PaymentMode } = req.body;

    if (cartItems.length == 0) {
        throw new ApiError(490, "No items in Cart")
    }

    if (!deliveryAddress || !PaymentMode) {
        throw new ApiError(400, "No delivery address or Payment Mode")
    }

    const shops = {};
    let totalAmount = 0;

    for (const It of cartItems) {

        const shopItem = await Item.findById(It.itemId).populate("itemOwner")

        if (!shopItem) {
            throw new ApiError(404, "No Such Item Found");
        }

        const subTotalAmount = It.quantity * shopItem.price;
        totalAmount += subTotalAmount;

        if (!shops[shopItem.itemOwner._id]) {
            shops[shopItem.itemOwner._id] = {
                shop: shopItem.itemOwner._id,
                items: [],
                subTotal: 0
            };
        }

        shops[shopItem.itemOwner._id].items.push({
            item: shopItem._id,   // better to store item id
            quantity: It.quantity,
            price: shopItem.price
        });

        shops[shopItem.itemOwner._id].subTotal += subTotalAmount;
    }

    const shop = Object.values(shops);

    const order = await Order.create({
        user: req.user._id,
        shops: shop,
        totalAmount,
        deliveryAddress,
        paymentMethod: PaymentMode
    });

    if (!order) {
        throw new ApiError(500, "Unable to recieve order , try again");
    }

    return res.status(200)
        .json(
            new ApiResponse(200,
                order,
                "Order Placed Suceesfully"
            )
        )


})

//getAll Order of user/shop

const GetAllOrder = asynchandler(async (req, res) => {
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
                    "No Orders present"
                )
            )
        }

        return res.status(200).json(
            new ApiResponse(200,
                orders,
                "Orders fetched sucessfully"
            )
        )
    }

    if (findUser.role === "Owner") {
        const isshop = await Shop.findOne({ owner: user });

        if (!isshop) {
            throw new ApiError(404, "Shop not found for this owner");
        }

        const orders = await Order.find({ "shops.shop": isshop._id })
            .sort({ createdAt: -1 })
            .populate("user", "fullname")
            .populate("shops.shop")
            .populate("shops.items.item", "name price foodType imageUrl")

        if (orders.length == 0) {
            return res.status(200).json(
                new ApiResponse(200,
                    "No Orders present"
                )
            )
        }

        return res.status(200).json(
            new ApiResponse(200,
                orders,
                "Orders fetched sucessfully"
            )
        )
    }
})


export { CreateOrder, GetAllOrder }