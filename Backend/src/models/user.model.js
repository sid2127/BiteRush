import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({

    fullname: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,

    },
    mobile: {
        type: Number,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ["User", "Owner", "Delivery Boy"],
        required: true
    },
    refreshToken: {
        type: String,
    },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }
    },
    orderOtp: {
        type: String,
        default: null
    },
    otpExpires: {
        type: Number,
    },
    socketId: {
        type: String
    },
    isOnline: {
        type: Boolean,
        default: false
    }

}, { timestamps: true })


userSchema.index({location:"2dsphere"})


userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});


userSchema.methods.isPasswordCorrect = async function (password) {

    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAcessToken = function () {
    return jwt.sign({
        id: this._id,
        email: this.email,
        fullname: this.fullname
    },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id,
    },

        process.env.REFRESH_TOKEN_SECRET,

        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}




const User = mongoose.model("User", userSchema);
export default User;
