import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js";
export const protectedRoute = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken;
        if(!token) return res.status(401).json({ message: "Unauthorized" });
        
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if(!decoded) return res.status(401).json({ message: "Unauthorized" });

        const user = await User.findById(decoded?.userId).select("-password");
        if(!user) return res.status(401).json({ message: "Unauthorized" });

        req.user = user;
        next();
    } catch (error) {
        console.log("Error in protected route middleware", error);
        res.status(500).json({ message: "Something went wrong", error: error.message })
    }
}