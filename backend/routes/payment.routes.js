import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middlewares.js";
import { checkoutSuccess, createCheckoutSession } from "../controllers/payment.controllers.js";

const router = Router();

router.route("/create-checkout-session").post(protectRoute, createCheckoutSession);
router.route("/checkout-success").post(protectRoute, checkoutSuccess);

export default router