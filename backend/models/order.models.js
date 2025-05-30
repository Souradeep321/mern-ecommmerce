import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		products: [
			{
				product: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Product",
					required: true,
				},
				quantity: {
					type: Number,
					required: true,
					min: 1,
				},
				price: {
					type: Number,
					required: true,
					min: 0,
				},
			},
		],
		totalAmount: {
			type: Number,
			required: true,
			min: 0,
		},

		// Razorpay specific fields
		razorpayOrderId: {
			type: String,
			required: true,
			unique: true,
		},
		razorpayPaymentId: {
			type: String,
		},
		razorpaySignature: {
			type: String,
		},

		paymentStatus: {
			type: String,
			enum: ["pending", "paid", "failed"],
			default: "pending",
		},
	},
	{ timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
