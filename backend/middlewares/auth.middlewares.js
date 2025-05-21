import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js";
export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken;
        if (!token) return res.status(401).json({ message: "Unauthorized - no accessToken provided" });
        try {
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            if (!decoded) return res.status(401).json({ message: "Unauthorized" });

            const user = await User.findById(decoded?.userId).select("-password");
            if (!user) return res.status(401).json({ message: "user not found" });

            req.user = user;

            next();
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({ message: "Token expired" });
            } else {
                throw error
            }
        }
    } catch (error) {
        console.log("Error in protected route middleware", error);
        res.status(500).json({ message: "Something went wrong", error: error.message })
    }
}

export const adminRoute = async (req, res, next) => {
    try {
       if(req.user && req.user.role === "admin"){
           next();
       }else{
           return res.status(403).json({ message: "Access denied - Admin only" });
       }
    } catch (error) {
        console.log("Error in admin route middleware", error);
        res.status(500).json({ message: "Something went wrong", error: error.message })
    }
}