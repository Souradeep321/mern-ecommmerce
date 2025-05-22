import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'

import connectDb from './db/connnection.js'

dotenv.config({
    path: 'backend/.env'
})

const app = express()
const port = process.env.PORT || 5001

// common middlewares
app.use(express.json({ limit: '16kb' })) // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })) // Parse URL-encoded request bodies
app.use(cookieParser())

// import routes
import authRoutes from './routes/auth.routes.js'
import productRoutes from './routes/product.routes.js'
import cartRoutes from './routes/cart.routes.js'
import couponRoutes from './routes/coupon.routes.js'
import paymentRoutes from './routes/payment.routes.js'

// routes
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/products", productRoutes)
app.use("/api/v1/cart", cartRoutes)
app.use("/api/v1/coupons", couponRoutes)
app.use("/api/v1/payments", paymentRoutes)

connectDb()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server is running at http://localhost:${port}`)
        })
    })
    .catch((error) => {
        console.log("MongoDb connection error", error);
        process.exit(1)
    })