import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDb = async () => {
    try {
        const conn = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        console.log(`Connected to MongoDb ${conn.connection.host}`)
    } catch (error) {
        console.log("MongoDb connection error", error);
        process.exit(1)
    }
}

export default connectDb