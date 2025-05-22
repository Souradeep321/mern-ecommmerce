import { Router } from "express";
import { protectRoute, adminRoute } from "../middlewares/auth.middlewares.js";
import { getAnalyticsData, getDailySalesData } from "../controllers/analytics.controllers.js";

const router = Router();

router.route("/").get(protectRoute, adminRoute, async (req, res) => {
    try {
        const analyticsData = await getAnalyticsData();

        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

        const dailySalesData = await getDailySalesData(startDate, endDate);

        res.status(200).json({
            analyticsData,
            dailySalesData
        });
    } catch (error) {
        console.log("Error in analytics route", error.message);
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
});

export default router