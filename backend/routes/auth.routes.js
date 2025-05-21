import { Router } from "express";
import { getProfile, login, logout, refreshToken, signup } from "../controllers/auth.controllers.js";
import { protectRoute } from "../middlewares/auth.middlewares.js";


const router = Router();

router.route("/signup").post(signup)
router.route("/login").post(login)
router.route("/logout").post(logout)
router.route("/refresh-token").post(refreshToken)
router.route("/profile").get(protectRoute, getProfile)

export default router