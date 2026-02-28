import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { CreateOrder, GetAllOrder } from "../controllers/order.controller.js";


const router = Router();

router.route('/createOrder').post(verifyJwt , CreateOrder)
router.route('/getAllOrders').get(verifyJwt , GetAllOrder);

export default router;