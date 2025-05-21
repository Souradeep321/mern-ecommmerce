import { Router } from "express";
import { createProduct, deleteProduct, getAllProducts, getFeaturedProducts, getProductByCategory, getRecommendedProducts, toggleFeaturedProduct } from "../controllers/product.controllers.js";
import { protectRoute, adminRoute } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middleware.js";


const router = Router();

router.route("/").get(protectRoute, adminRoute, getAllProducts)
router.route("/featured").get(getFeaturedProducts)
router.route("/category/:category").get(getProductByCategory)
router.route("/recommendations").get(getRecommendedProducts)
router.route("/").post(protectRoute, adminRoute, upload.single('image'), createProduct)
router.route("/:id").patch(protectRoute, adminRoute, toggleFeaturedProduct)
router.route("/:id").delete(protectRoute, adminRoute, deleteProduct)


export default router