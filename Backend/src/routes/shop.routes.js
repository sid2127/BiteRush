import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {  createUpdateShopDetails, getShopDetails, getShopsByCity } from "../controllers/shop.controller.js";


const router = Router();

router.route('/create-edit').post(
    verifyJwt,
    upload.single("image"),
    createUpdateShopDetails
)

router.route('/get-shop').get(verifyJwt , getShopDetails)
router.route('/getShopByCity/:city/:state').get(verifyJwt , getShopsByCity)

export default router;