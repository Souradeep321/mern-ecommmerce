import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === "development"
        ? "http://localhost:5000/api/v1"
        : "/api/v1",
    withCredentials: true, // ✅ Sends cookies with every request
});

export default axiosInstance;

