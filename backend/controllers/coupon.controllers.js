import { Coupon } from "../models/coupon.models.js";

export const getCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findOne({ userId: req.user._id, isActive: true });
        res.status(200).json({ message: "Coupon fetched successfully", coupon: coupon || null })
    } catch (error) {
        console.log("Error in getCoupon controller", error);
        res.status(500).json({ message: "Something went wrong", error: error.message })
    }
}

export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code || typeof code !== "string") {
      return res.status(400).json({ message: "Invalid coupon code" });
    }

    const coupon = await Coupon.findOne({
      code: new RegExp(`^${code}$`, 'i'),
      userId: req.user._id,
      isActive: true,
    });

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found or inactive" });
    }

    const now = new Date();
    if (coupon.expirationDate < now) {
      coupon.isActive = false;
      await coupon.save();
      return res.status(410).json({ message: "Coupon expired" }); // 410 = Gone
    }

    res.status(200).json({
      message: "Coupon is valid",
      code: coupon.code,
      discount: coupon.discountPercentage,
    });
  } catch (error) {
    console.error("Error in validateCoupon controller", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// export const validateCoupon = async (req, res) => {
//     try {
//         const { code } = req.body;
//         const coupon = await Coupon.findOne({ code: code, userId: req.user._id, isActive: true });

//         if (!coupon) {
//             return res.status(404).json({ message: "Coupon not found" });
//         }

//         if (coupon.expirationDate < new Date()) {
//             coupon.isActive = false;
//             await coupon.save();
//             return res.status(404).json({ message: "Coupon expired" });
//         }

//         res.status(200)
//             .json({
//                 message: "Coupon is valid",
//                 code: coupon.code,
//                 discount: coupon.discountPercentage
//             })
//     } catch (error) {
//         console.log("Error in validateCoupon controller", error);
//         res.status(500).json({ message: "Something went wrong", error: error.message })
//     }
// }