import { ApiError } from "../utils/ApiError.js"
import { asynchandler } from "../utils/AsyncHandler.js"
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";


const verifyJwt = asynchandler(async (req, res, next) => {

    console.log("🔥 NEW LOG - Cookies:", req.cookies);

    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        );

        const user = await User.findById(decoded.id)
            .select("-password -refreshToken");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }

        req.user = user;
        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Token expired"
        });
    }
});

export {verifyJwt}
