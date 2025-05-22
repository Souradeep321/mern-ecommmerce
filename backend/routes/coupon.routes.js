import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middlewares.js";
import { getCoupon, validateCoupon } from "../controllers/coupon.controllers.js";

const router = Router();

router.route("/").get(protectRoute, getCoupon);
router.route("/validate").get(protectRoute, validateCoupon);


export default router