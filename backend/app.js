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

// routes
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/products", productRoutes)

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