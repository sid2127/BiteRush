import { asynchandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user.model.js"


const generate_Acess_Refresh_Token = async (user) => {

    try {
        const accessToken = await user.generateAcessToken();
        const refreshToken = await user.generateRefreshToken();

        if (!accessToken || !refreshToken) {
            throw new ApiError(500, "Not able to generate Acess token or refresh token")
        }

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    }
    catch (error) {
        throw new ApiError(500, "Not able to generate token")
    }
}


const registerUser = asynchandler(async (req, res) => {

    const {
        fullname,
        email,
        mobile,
        password,
        role,
        address   // ✅ NEW
    } = req.body;

    // ✅ Validate basic fields
    if ([fullname, email, mobile, password, role].some((val) => !val || val.toString().trim() === "")) {
        throw new ApiError(400, "All Fields are required");
    }

    // ✅ Validate address fields
    if (
        !address ||
        !address.addressLine1 ||
        !address.city ||
        !address.state ||
        !address.pincode
    ) {
        throw new ApiError(400, "Complete address is required");
    }

    // ✅ Check existing user
    const userExist = await User.findOne({
        $or: [{ email }, { mobile }]
    });

    if (userExist) {
        throw new ApiError(400, "User already registered");
    }

    // ✅ Create user with address
    const user = await User.create({
        fullname,
        mobile,
        email,
        password,
        role,
        address: {
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2 || "",
            city: address.city,
            state: address.state,
            pincode: address.pincode
        }
    });

    if (!user) {
        throw new ApiError(500, "Internal server error! Please try again");
    }

    // ✅ Generate tokens
    const { accessToken, refreshToken } = await generate_Acess_Refresh_Token(user);

    if (!accessToken || !refreshToken) {
        throw new ApiError(500, "Unable to generate tokens");
    }

    // ✅ Remove sensitive data
    const logInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const option = {
        httpOnly: true,
        secure: true,
        sameSite: "None"
    };

    return res.status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
        .json(
            new ApiResponse(
                200,
                {
                    user: logInUser,
                    accessToken,
                    refreshToken
                },
                "User Registered Successfully"
            )
        );
});

const loginUser = asynchandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "enter all fields")
    }

    const isUser = await User.findOne({ email })

    if (!isUser) {
        throw new ApiError(400, "no user exists")
    }

    const isPasswordCorrect = await isUser.isPasswordCorrect(password)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Password Incorrect")
    }

    const { accessToken, refreshToken } = await generate_Acess_Refresh_Token(isUser)

    if (!accessToken || !refreshToken) {
        throw new ApiError(500, "Not able to generate Acess token or refresh token")
    }

    const logInUser = await User.findById(isUser._id).select(
        "-password -refreshToken"
    )

    const option = {
        httpOnly: true,
        secure: true,
        sameSite: "None"
    }


    return res.status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
        .json(
            new ApiResponse(
                200,
                {
                    user: logInUser, accessToken, refreshToken
                },
                "User login Successfully"
            )
        )

})

const logoutUser = asynchandler(async (req, res) => {

    const user = req.user;

    if (!user) {
        throw new ApiError(400, "No one is login")
    }

    const lgtUser = await User.findByIdAndUpdate(
        user._id,
        {
            $unset: { refreshToken: 1 }
        },
        { new: true }
    );


    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None"
    }

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,
                {},
                "Logout Sucessfully"
            )
        )
})

const GoogleLogin = asynchandler(async (req, res) => {
    const { email, mobile, role } = req.body;

    if (!email || !mobile || !role) {
        throw new ApiError(400, "Enter mobile no ")
    }

    let user = await User.findOne({
        $or: [
            { email, mobile }
        ]
    })

    if (!user) {
        user = await User.create({
            email,
            mobile,
            role
        })

        if (!user) {
            throw ApiError(500, "Not able to SignUp , try again")
        }
    }

    const { accessToken, refreshToken } = generate_Acess_Refresh_Token(user);

    const option = {
        httOnly: true,
        secure: true,
  sameSite: "None"
    }

    return res.status(201)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
        .json(
            new ApiResponse(
                200,
                user,
                "Succesfully logined In"
            )
        )


})

const getCurrentUser = asynchandler(async (req, res) => {
    const user = req.user;

    if (!user) {
        throw ApiError(400, "No user exist");
    }

    res.status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "User Fetched Suceesfully"
            )
        )
})

//update location

const updateLocation = asynchandler(async(req , res)=> {
    const {lat , lon} = req.body;

    if(!lat || !lon){
        throw new ApiError(400 , "no latitude or longitude found")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            location: {
                type: 'Point',
                coordinates: [lon , lat]
            }
        },
        {
            new: true
        }
    )

    if(!user){
        throw new ApiError(500 , "unable to update location")
    }

    return res.status(200)
    .json(
        new ApiResponse(200,
            user,
            "Location update sucessfully"
        )
    )
})



export { registerUser, loginUser, logoutUser, GoogleLogin, getCurrentUser , updateLocation};
