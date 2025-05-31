import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { MoveRight } from "lucide-react";
import axios from "../lib/axios";
import { useCartStore } from "../store/useCartStore";
import { useUserStore } from "../store/useUserStore";
import { toast } from "react-hot-toast";
import conf from "../config/conf";
import { useState } from "react";

const OrderSummary = () => {
    const { total, subtotal, cart, coupon, isCouponApplied, clearCart } = useCartStore();
    const { user } = useUserStore();
    const navigate = useNavigate();
    const [paymentError, setPaymentError] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const loggedInUser = user?.user;

    const savings = subtotal - total;
    const formattedSubtotal = subtotal.toFixed(2);
    const formattedTotal = total.toFixed(2);
    const formattedSavings = savings.toFixed(2);

    const handlePayment = async () => {
        setPaymentError("");
        setIsProcessing(true);

        // Check Razorpay script
        if (typeof window === "undefined" || !window.Razorpay) {
            toast.error("Razorpay SDK is not loaded.");
            setIsProcessing(false);
            return;
        }

        // Check if cart is empty
        if (!cart.length) {
            toast.error("Your cart is empty.");
            setIsProcessing(false);
            return;
        }

        try {
            const res = await axios.post("/payments/create-checkout-session", {
                products: cart,
                couponCode: coupon ? coupon.code : null,
            });

            const { razorpayOrderId, amount, currency } = res.data;

            const options = {
                key: conf.razorpayKeyId,
                amount: amount * 100, // in paise
                currency,
                name: "Ecommerce",
                description: "Product Purchase",
                order_id: razorpayOrderId,
                handler: async (response) => {
                    try {
                        const validateRes = await axios.post("/payments/checkout-success", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        const validateResData = validateRes.data;

                        if (!validateResData.success) {
                            throw new Error(validateResData.message || "Payment validation failed.");
                        }

                        await clearCart();
                        toast.success("Payment successful!");
                        navigate(`/purchase-success/${validateResData.orderId}`);
                    } catch (err) {
                        console.error("Validation error:", err);
                        toast.error(err.message || "Payment verification failed.");
                    } finally {
                        setIsProcessing(false);
                    }
                },
                prefill: {
                    name: loggedInUser?.name,
                    email: loggedInUser?.email,
                },
                theme: {
                    color: "#10b981",
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error("Payment error:", error);
            setPaymentError(error.response?.data?.error || "Something went wrong");
            toast.error("Failed to initiate payment.");
            setIsProcessing(false);
        }
    };

    return (
        <motion.div
            className='space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <p className='text-xl font-semibold text-emerald-400'>Order summary</p>

            <div className='space-y-4'>
                <div className='space-y-2'>
                    <dl className='flex items-center justify-between gap-4'>
                        <dt className='text-base font-normal text-gray-300'>Original price</dt>
                        <dd className='text-base font-medium text-white'>₹{formattedSubtotal}</dd>
                    </dl>

                    {savings > 0 && (
                        <dl className='flex items-center justify-between gap-4'>
                            <dt className='text-base font-normal text-gray-300'>Savings</dt>
                            <dd className='text-base font-medium text-emerald-400'>-₹{formattedSavings}</dd>
                        </dl>
                    )}

                    {coupon && isCouponApplied && (
                        <dl className='flex items-center justify-between gap-4'>
                            <dt className='text-base font-normal text-gray-300'>Coupon ({coupon.code})</dt>
                            <dd className='text-base font-medium text-emerald-400'>-{coupon.discountPercentage}%</dd>
                        </dl>
                    )}

                    <dl className='flex items-center justify-between gap-4 border-t border-gray-600 pt-2'>
                        <dt className='text-base font-bold text-white'>Total</dt>
                        <dd className='text-base font-bold text-emerald-400'>₹{formattedTotal}</dd>
                    </dl>
                </div>

                <motion.button
                    className={`flex w-full items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium text-white 
                        ${isProcessing ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'} 
                        focus:outline-none focus:ring-4 focus:ring-emerald-300`}
                    whileHover={!isProcessing ? { scale: 1.05 } : {}}
                    whileTap={!isProcessing ? { scale: 0.95 } : {}}
                    disabled={isProcessing}
                    onClick={handlePayment}
                >
                    {isProcessing ? "Processing Payment..." : "Checkout"}
                </motion.button>

                {paymentError && (
                    <p className="text-sm text-red-400 text-center">{paymentError}</p>
                )}

                <div className='flex items-center justify-center gap-2'>
                    <span className='text-sm font-normal text-gray-400'>or</span>
                    <Link
                        to='/'
                        className='inline-flex items-center gap-2 text-sm font-medium text-emerald-400 underline hover:text-emerald-300 hover:no-underline'
                    >
                        Continue Shopping
                        <MoveRight size={16} />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

export default OrderSummary;
