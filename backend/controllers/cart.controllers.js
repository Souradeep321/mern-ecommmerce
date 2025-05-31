import { Product } from "../models/product.models.js"

export const getCartProducts = async (req, res) => {
    try {
        const cartItems = req.user.cartItems || [];

        if (cartItems.length === 0) {
            return res.status(200).json({
                message: "Your cart is empty",
                cartItems: [],
            });
        }

        const productIds = cartItems.map((item) => item.product);
        const products = await Product.find({ _id: { $in: productIds } });

        const cartWithQuantity = products.map((product) => {
            const item = cartItems.find(
                (i) => i.product.toString() === product._id.toString()
            );
            return {
                ...product.toJSON(),
                quantity: item?.quantity || 1, // fallback to 1 if not found
            };
        });

        return res.status(200).json({
            message: "Cart products fetched successfully",
            cartItems: cartWithQuantity,
        });
    } catch (error) {
        console.error("Error in getCartProducts controller:", error.message);
        return res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};

export const addToCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = req.user;

        const existingItem = user.cartItems.find(
            (item) => item.product && item.product.toString() === productId
        );

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            user.cartItems.push({ product: productId, quantity: 1 });
        }

        await user.save();

        res.status(200).json({
            message: "Product added to cart successfully",
            cartItems: user.cartItems,
        });
    } catch (error) {
        console.log("Error in addToCart controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const removeAllFromCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = req.user;

        if (!productId) {
            user.cartItems = [];
        } else {
            user.cartItems = user.cartItems.filter(
                (item) => item.product && item.product.toString() !== productId
            );
        }

        await user.save();

        res.status(200)
            .json({
                message: "Product removed from cart successfully",
                cartItems: user.cartItems,
            });
    } catch (error) {
        console.log("Error in removeAllFromCart controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateQuantity = async (req, res) => {
    try {
        const { id: productId } = req.params;
        const { quantity } = req.body
        const user = req.user;
        const exsistingItem = user.cartItems.find((item) => item.product && item.product.toString() === productId);

        if (exsistingItem) {
            if (quantity === 0) {
                user.cartItems = user.cartItems.filter((item) => item.product && item.product.toString() !== productId);
                await user.save();
                return res.status(200).json({ message: "Product removed from cart successfully", cartItems: user.cartItems });
            } else {
                exsistingItem.quantity = quantity;
                await user.save();
                return res.status(200).json({ message: "Product quantity updated successfully", cartItems: user.cartItems });
            }
        } else {
            return res.status(404).json({ message: "Product not found in cart" });
        }
    } catch (error) {
        console.log("Error in updateQuantity controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const deleteCartProducts = async (req, res) => {
    try {
        const user = req.user;
        user.cartItems = [];
        await user.save();
        res.status(200).json({ message: "Cart cleared successfully", cartItems: user.cartItems });
    } catch (error) {
        console.log("Error in deleteCartProducts controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}