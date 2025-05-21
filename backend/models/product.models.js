import mongoose, { Schema } from "mongoose";

const productSchema = new Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    description: {
        type: String,
        required: [true, "Description is required"],
    },
    price: {
        type: Number,
        min: 0,
        required: [true, "Price is required"],
    },
    image: {
        type: String,
        required: [true, "Image is required"],
    },
    category: {
        type: String,
        required: [true, "Category is required"],
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    countInStock: {
        type: Number,
        required: [true, "Count in stock is required"],
    },
}, { timestamps: true })

export const Product = mongoose.model("Product", productSchema)
