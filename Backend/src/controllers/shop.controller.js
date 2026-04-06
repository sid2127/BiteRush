
import { Shop } from '../models/shop.model.js';
import { UploadOnCloudinary } from '../utils/cloudinary.js';
import { asynchandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

import { ApiResponse } from "../utils/ApiResponse.js";
import User from '../models/user.model.js';

// Create or Update Shop (Single Controller)

const createUpdateShopDetails = asynchandler(async (req, res) => {
  const { name, city, state, address } = req.body;
  const owner = req.user._id;

  // Find shop for owner
  let shop = await Shop.findOne({ owner });

  // Get image path (if uploaded)
  const imageLocalPath = req.file?.path;

  // 👉 CASE 1: CREATE SHOP
  if (!shop) {

    // Validation for CREATE
    if (
      [name, city, state, address].some(field => !field?.trim()) ||
      !imageLocalPath
    ) {
      throw new ApiError(400, "All fields and shop image are required");
    }

    // Upload image
    const upload = await UploadOnCloudinary(imageLocalPath);
    if (!upload?.secure_url) {
      throw new ApiError(500, "Image upload failed");
    }

    shop = await Shop.create({
      name,
      city,
      state,
      address,
      owner,
      shopImage: upload.secure_url
    });

    return res.status(201).json(
      new ApiResponse(201, shop, "Shop created successfully")
    );
  }

  // 👉 CASE 2: UPDATE SHOP
  if (
    ![name, city, state, address].some(Boolean) &&
    !imageLocalPath
  ) {
    throw new ApiError(400, "Nothing to update");
  }

  let imageUrl = shop.shopImage;

  if (imageLocalPath) {
    const upload = await UploadOnCloudinary(imageLocalPath);
    if (!upload?.secure_url) {
      throw new ApiError(500, "Image upload failed");
    }
    imageUrl = upload.secure_url;
  }

  shop = await Shop.findByIdAndUpdate(
    shop._id,
    {
      $set: {
        name: name ?? shop.name,
        city: city ?? shop.city,
        state: state ?? shop.state,
        address: address ?? shop.address,
        shopImage: imageUrl,
        owner: owner
      }
    },
    { new: true }
  );

  return res.status(200).json(
    new ApiResponse(200, shop, "Shop updated successfully")
  );
});


const getShopDetails = asynchandler(async (req, res) => {


  const shop = await Shop.findOne({
    owner: req.user._id
  })

  if (!shop) {
    throw new ApiError(400, "Shop doesnt exist");
  }

  return res.status(200).json(
    new ApiResponse(200,
      shop,
      "Shop succesffuly fetched"
    )
  )
})

//Shops By City

const getShopsByCity = asynchandler(async (req, res) => {

  const { latitude, longitude } = req.params;

  if (!latitude || !longitude) {
    throw new ApiError(400, "Latitude and Longitude required");
  }

  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);

  // ✅ Step 1: Find nearby OWNERS (Users with role = Owner)
  const nearbyOwners = await User.find({
    role: "Owner",
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [lon, lat] // ⚠️ [longitude, latitude]
        },
        $maxDistance: 10000 // 10 km
      }
    }
  }).select("_id fullname location");

  if (!nearbyOwners.length) {
    return res.status(200).json(
      new ApiResponse(200, [], "No shops nearby")
    );
  }

  // ✅ Step 2: Extract owner IDs
  const ownerIds = nearbyOwners.map(owner => owner._id);

  // ✅ Step 3: Find shops of those owners
  const shops = await Shop.find({
    owner: { $in: ownerIds }
  }).populate("owner", "fullname email");

  // ✅ Step 4: Response
  return res.status(200).json(
    new ApiResponse(200, shops, "Nearby shops fetched successfully")
  );
});


export { createUpdateShopDetails, getShopDetails, getShopsByCity };