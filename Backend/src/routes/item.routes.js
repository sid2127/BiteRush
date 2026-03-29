import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { createItem, getItemById, getItemsByShopId, searchItems, updateItem, deleteItem, getItemsByCity, rating } from "../controllers/item.controller.js";
import { upload } from "../middlewares/multer.middleware.js";


const router = Router();

router.route("/createItem").post(
    verifyJwt ,
    upload.single("image"),
    createItem);
router.route("/updateItem/:itemId").put(verifyJwt ,
    upload.single("image")
    , updateItem);
router.route("/getItemById/:itemId").get(verifyJwt , getItemById);
router.route("/deleteItem/:itemId").delete(verifyJwt , deleteItem);
router.route("/getItemsByShop/:shopId").get(verifyJwt , getItemsByShopId);
router.route("/searchItems").get(verifyJwt ,searchItems );
router.route("/getItemsByCity/:city/:state").get(verifyJwt , getItemsByCity);
router.route("/rating/:itemId").post(verifyJwt , rating);

export default router;