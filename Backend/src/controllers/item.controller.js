import { Item } from "../models/item.model.js";
import { Shop } from "../models/shop.model.js";
import { asynchandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { UploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";

const createItem = asynchandler(async (req, res) => {
    const { name, description, price, category, foodType } = req.body;

    if (!name || !price || !category || !foodType) {
        throw new ApiError(400, "All required fields must be provided");
    }

    if (price <= 0) {
        throw new ApiError(400, "Price must be greater than 0");
    }

    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) {
        throw new ApiError(404, "Shop not found for owner");
    }

    const imageLocalPath = req.file?.path;
    if (!imageLocalPath) {
        throw new ApiError(400, "Item image is required");
    }

    const uploadedImage = await UploadOnCloudinary(imageLocalPath);
    if (!uploadedImage?.secure_url) {
        throw new ApiError(500, "Failed to upload image");
    }

    const item = await Item.create({
        name,
        description,
        price,
        category,
        foodType,
        imageUrl: uploadedImage.secure_url,
        itemOwner: shop._id
    });

    if (!item) {
        throw new ApiError(500, "Item creation failed");
    }

    return res.status(201).json(
        new ApiResponse(201, item, "Item created successfully")
    );
});

const updateItem = asynchandler(async (req, res) => {
    const { name, description, price, category, foodType } = req.body;
    const { itemId } = req.params;

    if (itemId === undefined) {
        throw new ApiError(400, "Items Id not there");
    }

    if (!name && !price && !category && !foodType) {
        throw new ApiError(400, "Any one require fields must be provided");
    }

    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) {
        throw new ApiError(404, "Shop not found for owner");
    }

    const imageLocalPath = req.file?.path;

    let uploadedImage = null;

    if (imageLocalPath) {
        uploadedImage = await UploadOnCloudinary(imageLocalPath);
        if (!uploadedImage?.secure_url) {
            throw new ApiError(500, "Failed to upload image");
        }
    }

    const item = await Item.findOneAndUpdate(
        { _id: itemId, itemOwner: shop._id }, // 🔐 security
        {
            $set: {
                ...(name && { name }),
                ...(description && { description }),
                ...(price && { price }),
                ...(category && { category }),
                ...(foodType && { foodType }),
                ...(uploadedImage?.secure_url && { imageUrl: uploadedImage.secure_url })

            }
        },
        { new: true }
    );


    if (!item) {
        throw new ApiError(500, "Item creation failed");
    }

    return res.status(201).json(
        new ApiResponse(201, item, "Item updated successfully")
    );
});

//getItem By Id 

const getItemById = asynchandler(async (req, res) => {
    const { itemId } = req.params;

    if (!itemId) {
        throw new ApiError(400, "item Id is required");
    }

    const item = await Item.findById(itemId);

    if (!item) {
        throw new ApiError(400, "Item not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            item,
            "Item fetched successfully"
        )
    )
})

//getItems By shopId 

const getItemsByShopId = asynchandler(async (req, res) => {
    const { shopId } = req.params;

    if (!shopId) {
        throw new ApiError(400, "Shop Id is required");
    }

    // 1️⃣ Validate shop
    const shop = await Shop.findById(shopId);
    if (!shop) {
        throw new ApiError(404, "Shop not found");
    }

    // 2️⃣ Fetch items
    const items = await Item.find({ itemOwner: shopId })
        .select("-itemOwner");

    // 3️⃣ Always return same shape
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                items
            },
            items.length === 0
                ? "No items found"
                : "Items fetched successfully"
        )
    );
});


//getSearch item

const searchItems = asynchandler(async (req, res) => {
    const { query, city } = req.query;

    if (!query || !city) {
        throw new ApiError(400, "query and city are required");
    }

    const items = await Item.aggregate([
        // 1️⃣ Match item name
        {
            $match: {
                name: { $regex: query, $options: "i" }
            }
        },

        // 2️⃣ Join with Shop
        {
            $lookup: {
                from: "shops", // collection name
                localField: "itemOwner",
                foreignField: "_id",
                as: "shop",
                pipeline: [
                    {
                        $project: {
                            name: 1,
                            city: 1,
                            address: 1,
                            shopImage: 1
                        }
                    }
                ]
            }
        },

        // 3️⃣ Convert shop array → object
        {
            $unwind: "$shop"
        },

        // 4️⃣ Match city
        {
            $match: {
                "shop.city": { $regex: `^${city}$`, $options: "i" }
            }
        },

        // 5️⃣ Final response shape (optional but recommended)
        {
            $project: {
                name: 1,
                price: 1,
                category: 1,
                foodType: 1,
                imageUrl: 1
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, items, "Items fetched successfully")
    );
});

//rating update

const rating = asynchandler(async (req, res) => {

    const { itemId } = req.params;
    const { rating } = req.body;

    if (!itemId || !rating) {
        return res.status(400).json({ message: "itemId and rating is required" })
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: "rating must be between 1 to 5" })
    }

    const item = await Item.findById(itemId)
    if (!item) {
        return res.status(400).json({ message: "item not found" })
    }

    await Item.findByIdAndUpdate(
        itemId,
        {
            $inc: { "rating.count": 1 },
            $set: {
                "rating.average":
                    (item.rating.average * item.rating.count + rating) /
                    (item.rating.count + 1)
            }
        },
        { new: true })
    return res.status(200).json(
        new ApiResponse(
            200,
            { rating: item.rating },
            "Rating updated sucessfully"
        )
    )
})

//delete item 

const deleteItem = asynchandler(async (req, res) => {
  const { itemId } = req.params;

  if (!itemId) {
    throw new ApiError(400, "Item Id is required");
  }

  const shop = await Shop.findOne({owner: req.user._id});

  if(!shop){
    throw new ApiError(404 , "Shop not found for owner");
  }

  const item = await Item.findOneAndDelete({
    _id: itemId,
    itemOwner: shop._id
  });

  if (!item) {
    throw new ApiError(404, "No item exists");
  }

  return res.status(200).json(
    new ApiResponse(200, item, "Deleted Successfully")
  );
});

//get Items By City

const getItemsByCity = asynchandler(async (req, res) => {

   const { city, state } = req.params;

   if (!city || !state) {
      throw new ApiError(400, "City and state required");
   }

   const items = await Item.aggregate([

      // 1️⃣ Join with Shop collection
      {
         $lookup: {
            from: "shops", // collection name (lowercase plural)
            localField: "itemOwner",
            foreignField: "_id",
            as: "shop"
         }
      },

      // 2️⃣ Convert shop array to object
      {
         $unwind: "$shop"
      },

      // 3️⃣ Match city and state
      {
         $match: {
            "shop.city": { $regex: city, $options: "i" },
            "shop.state": { $regex: state, $options: "i" }
         }
      }

   ]);

   if(!items){
    return res.status(200).json(
        200,
        "No items avialable"
    )
   }

   return res.status(200).json(
    new ApiResponse(200,
        items,
        "Sucessfully fetched all items in city"
    )
   );
});




export { createItem, updateItem, getItemById, getItemsByShopId, searchItems, rating, deleteItem, getItemsByCity };