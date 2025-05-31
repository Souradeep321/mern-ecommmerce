import Razorpay from "razorpay";
import crypto from "crypto";
import { Coupon } from "../models/coupon.models.js";
import { Order } from "../models/order.models.js";


// init Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createCheckoutSession = async (req, res) => {
  try {
    const { products, couponCode } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Invalid or empty products array" });
    }

    let totalAmount = 0;

    const lineItems = products.map((product) => {
      totalAmount += product.price * product.quantity;
      return {
        id: product._id, // ✅ ADD THIS
        name: product.name,
        image: product.image,
        quantity: product.quantity,
        price: product.price,
      };
    });

    let discount = 0;
    let coupon = null;

    if (couponCode) {
      coupon = await Coupon.findOne({ code: couponCode, userId: req.user._id, isActive: true });
      if (coupon) {
        discount = (totalAmount * coupon.discountPercentage) / 100;
        totalAmount -= discount;
      }
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), // Razorpay uses paise
      currency: "INR",
      receipt: `order_rcptid_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        couponCode: couponCode || "",
        products: JSON.stringify(lineItems),
        discount: discount.toString(),
      },
    });

    if (totalAmount >= 2000) {
      await createNewCoupon(req.user._id);
    }

    res.status(200).json({
      razorpayOrderId: razorpayOrder.id,
      amount: totalAmount,
      currency: "INR",
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ message: "Error creating Razorpay order", error: error.message });
  }
};

export const checkoutSuccess = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);

    const { userId, couponCode, products, discount } = razorpayOrder.notes;

    if (couponCode) {
      await Coupon.findOneAndUpdate(
        { code: couponCode, userId: userId },
        { isActive: false }
      );
    }

    const parsedProducts = JSON.parse(products);

    const totalAmount = razorpayOrder.amount / 100;

    const newOrder = new Order({
      user: userId,
      products: parsedProducts.map((p) => ({
        product: p.id,
        quantity: p.quantity,
        price: p.price,
      })),
      totalAmount,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paymentStatus: "paid",
    });

    await newOrder.save();

    res.status(200).json({
      success: true,
      message: "Payment successful, order created, and coupon deactivated if used.",
      orderId: newOrder._id,
    });
  } catch (error) {
    console.error("Error processing Razorpay success:", error);
    res.status(500).json({ message: "Error processing payment success", error: error.message });
  }
};

async function createNewCoupon(userId) {
  await Coupon.findOneAndDelete({ userId });

  const newCoupon = new Coupon({
    code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    discountPercentage: 10,
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    userId: userId,
  });

  await newCoupon.save();

  return newCoupon;
}
