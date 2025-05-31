import { redis } from "../lib/redis.js"
import { User } from "../models/user.models.js"
import jwt from "jsonwebtoken"

const generateTokens = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m",
    })
    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d",
    })
    return ({
        accessToken,
        refreshToken
    })
}

const storeRefreshToken = async (userId, refreshToken) => {
    await redis.set(`refresh_token:${userId}`, refreshToken, 'EX', 7 * 24 * 60 * 60);
};


const setCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true, // prevent xss
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 15 * 60 * 1000
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
}

export const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }

        const userExist = await User.findOne({ email })
        if (userExist) {
            return res.status(400).json({ message: "User already exist" })
        }

        const user = await User.create({ name, email, password })
        // authenticate user
        const { accessToken, refreshToken } = generateTokens(user._id)
        await storeRefreshToken(user._id, refreshToken)

        setCookies(res, accessToken, refreshToken)

        const newUser = await User.findById(user._id).select("-password")
        res.status(201).json({ message: "User created successfully", user: newUser })
    } catch (error) {
        console.log("Error in signup controller", error);
        res.status(500).json({ message: error.message })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "User does not exist" })
        }

        if (user && (await user.comparePassword(password))) {
            const { accessToken, refreshToken } = generateTokens(user._id)

            await storeRefreshToken(user._id, refreshToken)
            setCookies(res, accessToken, refreshToken)

            const updatedUser = await User.findById(user._id).select("-password")

            res.status(200).json({ message: "User logged in successfully", user: updatedUser })
        } else {
            res.status(401).json({ message: "Invalid credentials" })
        }

    } catch (error) {
        console.log("Error in login controller", error);
        res.status(500).json({ message: "Something went wrong", error: error.message })
    }
}

export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            const userId = decoded.userId;
            await redis.del(`refresh_token:${userId}`);
        }

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        console.log("Error in logout controller", error);
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
}

// this will refresh the access token 
export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

        if (storedToken !== refreshToken) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { accessToken } = generateTokens(decoded.userId);

        res.cookie("accessToken", accessToken, {
            httpOnly: true, // prevent xss
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
            maxAge: 15 * 60 * 1000
        });
 
        res.status(200).json({ message: "Token refreshed successfully" });
    } catch (error) {
        console.log("Error in refresh token controller", error);
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
}

export const getProfile = async (req, res) => {
    try {
        res.status(200).json({ message: "User profile", user: req.user })
    } catch (error) {
        console.log("Error in get profile controller", error);
        res.status(500).json({ message: "Something went wrong", error: error.message })
    }
}