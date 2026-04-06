import { asynchandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user.model.js";

/* ================================
   🔐 Generate Tokens
================================ */
const generate_Acess_Refresh_Token = async (user) => {
  try {
    const accessToken = await user.generateAcessToken();
    const refreshToken = await user.generateRefreshToken();

    if (!accessToken || !refreshToken) {
      throw new ApiError(500, "Token generation failed");
    }

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Unable to generate tokens");
  }
};

/* ================================
   🧾 Register User
================================ */
const registerUser = asynchandler(async (req, res) => {
  const { fullname, email, mobile, password, role } = req.body;

  if ([fullname, email, mobile, password, role].some(
    (val) => !val || val.toString().trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const userExist = await User.findOne({
    $or: [{ email }, { mobile }]
  });

  if (userExist) {
    throw new ApiError(400, "User already exists");
  }

  const user = await User.create({
    fullname,
    email,
    mobile,
    password,
    role
  });

  const { accessToken, refreshToken } = await generate_Acess_Refresh_Token(user);

  const createdUser = await User.findById(user._id)
    .select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/"
  };

  return res.status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(
      201,
      { user: createdUser, accessToken, refreshToken },
      "User registered successfully"
    ));
});

/* ================================
   🔑 Login User
================================ */
const loginUser = asynchandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Enter all fields");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(400, "User not found");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Incorrect password");
  }

  const { accessToken, refreshToken } = await generate_Acess_Refresh_Token(user);

  const logInUser = await User.findById(user._id)
    .select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/"
  };

  return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(
      200,
      { user: logInUser, accessToken, refreshToken },
      "Login successful"
    ));
});

/* ================================
   🚪 Logout
================================ */
const logoutUser = asynchandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(400, "No user logged in");
  }

  await User.findByIdAndUpdate(user._id, {
    $unset: { refreshToken: 1 }
  });

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/"
  };

  return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Logout successful"));
});

/* ================================
   🔵 Google Login
================================ */
const GoogleLogin = asynchandler(async (req, res) => {
  const { email, mobile, role } = req.body;

  if (!email || !mobile || !role) {
    throw new ApiError(400, "Missing fields");
  }

  let user = await User.findOne({
    $or: [{ email }, { mobile }]
  });

  if (!user) {
    user = await User.create({ email, mobile, role });
  }

  const { accessToken, refreshToken } = await generate_Acess_Refresh_Token(user);

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/"
  };

  return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, user, "Google login successful"));
});

/* ================================
   👤 Current User
================================ */
const getCurrentUser = asynchandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(400, "No user found");
  }

  return res.status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

/* ================================
   📍 Update Location
================================ */
const updateLocation = asynchandler(async (req, res) => {
  const { lat, lon } = req.body;

  if (!lat || !lon) {
    throw new ApiError(400, "Latitude & Longitude required");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      location: {
        type: "Point",
        coordinates: [lon, lat]
      }
    },
    { new: true }
  ).select("-password -refreshToken");

  return res.status(200)
    .json(new ApiResponse(200, user, "Location updated"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  GoogleLogin,
  getCurrentUser,
  updateLocation
};
