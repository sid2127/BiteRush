import { Router } from "express";
import { getCurrentUser, GoogleLogin, loginUser, logoutUser, registerUser } from "../controllers/auth.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/signup").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJwt , logoutUser)
router.route("/googleAuth").post(GoogleLogin);
router.route("/getCurrentUser").get(verifyJwt, getCurrentUser);

export default router;

