import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { AcceptOrder, ChangeStatus, CreateOrder, GenerateOtp, GetAllBroadCastedOrders, GetAllOrder, GetCurrentlyAssignOrder, GetOrderById, VerifyOrderOtp, VerifyPayment } from "../controllers/order.controller.js";


const router = Router();

router.route('/createOrder').post(verifyJwt , CreateOrder)
router.route('/getAllOrders').get(verifyJwt , GetAllOrder);
router.route('/updateStatus/:orderId/:shopId').post(verifyJwt , ChangeStatus);
router.route('/getAllBroadCastedOrders').get(verifyJwt , GetAllBroadCastedOrders);
router.route('/accept-Order/:orderId').put(verifyJwt , AcceptOrder);
router.route('/getCurrentOrder').get(verifyJwt , GetCurrentlyAssignOrder);
router.route('/getOrderById/:orderId/:shopId').get(verifyJwt , GetOrderById);
router.route('/generateOtp/:orderId/:shopId').get(verifyJwt , GenerateOtp);
router.route('/validateOtp/:orderId/:shopId/:Otp').get(verifyJwt , VerifyOrderOtp);
router.route('/verifyPayment').post(verifyJwt , VerifyPayment)

export default router;