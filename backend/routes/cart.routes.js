import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middlewares.js";
import { addToCart, getCartProducts, removeAllFromCart, updateQuantity } from "../controllers/cart.controllers.js";


const router = Router();

router.route("/").get(protectRoute, getCartProducts)
router.route("/").post(protectRoute, addToCart)
router.route("/").delete(protectRoute, removeAllFromCart)
router.route("/:id").put(protectRoute, updateQuantity)


export default router