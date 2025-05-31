import { deleteFromCloudinary, uploadOnCloudinary } from "../lib/cloudinary.js";
import { redis } from "../lib/redis.js";
import { Product } from "../models/product.models.js";

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.status(200).json({ message: "Products fetched successfully", products })
    } catch (error) {
        console.log("Error in get all products controller", error);
        res.status(500).json({ message: "Something went wrong", error: error.message })
    }
}

export const getFeaturedProducts = async (req, res) => {
    try {
        let featuredProducts = await redis.get("featured_products")
        if (featuredProducts) {
            return res.json(JSON.parse(featuredProducts))
        }

        // if not in redis fetch it from mongodb 
        // .lean() is gonna return a plain javascript object instead of a mongodb document
        featuredProducts = await Product.find({ isFeatured: true }).lean();

        if (!featuredProducts) {
            return res.status(404).json({ message: "No featured products found" })
        }
        // store in redis for quick access
        await redis.set("featured_products", JSON.stringify(featuredProducts))

        res.status(200).json({ message: "Products fetched successfully", products: featuredProducts })
    } catch (error) {
        console.log("Error in get all products controller", error);
        res.status(500).json({ message: "Something went wrong", error: error.message })
    }
}

export const createProduct = async (req, res) => {
    let image;
    try {
        const { name, description, price, category, countInStock } = req.body;
        if (!name || !description || !price || !category || !countInStock) {
            return res.status(400).json({ message: "All fields are required" })
        }
        console.log(req.file);
        const imageLocalPath = req.file?.path;
        if (!imageLocalPath) {
            return res.status(400).json({ message: "Image is required" })
        }

        try {
            image = await uploadOnCloudinary(imageLocalPath);
            // console.log("Image uploaded on cloudinary. File src: " + image.url);
        } catch (error) {
            console.error("Error uploading image:", error);
            return res.status(500).json({ message: "Failed to upload image" });
        }

        if (!image?.url) {
            return res.status(500).json({ message: "Image upload failed" });
        }

        const product = await Product.create({
            name,
            description,
            price,
            image: image.url || "",
            category,
            countInStock
        });
        res.status(201).json({ message: "Product created successfully", product });
    } catch (error) {
        console.error("Error in createProducts controller:", error);
        if (image?.public_id) {
            await deleteFromCloudinary(image.public_id);
        }
        res.status(500).json({ message: "Something went wrong", error: error.message })
    }
}

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ message: "Product not found" })

        if (product.image) {
            try {
                const imageUrl = product.image;
                const imageFileName = imageUrl.split("/").pop();
                const imagePublicId = imageFileName?.split(".")[0];
                if (imagePublicId) {
                    await deleteFromCloudinary(imagePublicId);
                }
            } catch (err) {
                console.warn("Failed to delete image from Cloudinary:", err.message);
            }
        }

        await Product.findByIdAndDelete(id);
        res.status(200).json({ message: "Product deleted successfully", product })
    } catch (error) {
        console.log("Error in delete product controller", error);
        res.status(500).json({ message: "Something went wrong", error: error.message })
    }
}

export const getRecommendedProducts = async (req, res) => {
    try {
        const product = await Product.aggregate([
            {
                $sample: { size: 4 }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    image: 1,
                    price: 1,
                    description: 1
                }
            }
        ])
        res.status(200).json({ products: product })
    } catch (error) {
        console.log("Error in get recommended products controller", error);
        res.status(500).json({ message: "Something went wrong", error: error.message })
    }
}

export const getProductByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const products = await Product.find({ category });
        res.status(200).json({ message: "Products fetched successfully", products })
    } catch (error) {
        console.log("Error in get product by category controller", error);
        res.status(500).json({ message: "Something went wrong", error: error.message })
    }
}

export const toggleFeaturedProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if(product){
            product.isFeatured = !product.isFeatured;
            const updatedProduct = await product.save();
            // update in redis
            await updaFeaturedProductsInRedis();
            res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
        }else{
            res.status(404).json({ message: "Product not found" })
        }
    } catch (error) {
        console.log("Error in toggle featured product controller", error);
        res.status(500).json({ message: "Something went wrong", error: error.message })
    }
}

async function updaFeaturedProductsInRedis() {
    try {
        const featuredProducts = await Product.find({ isFeatured: true }).lean();
        await redis.set("featured_products", JSON.stringify(featuredProducts));
    } catch (error) {
        console.log("Error updating featured products in redis", error);
    }
}