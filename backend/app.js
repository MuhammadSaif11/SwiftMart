import express from "express";
import globalErrorHandler from "./controllers/errorController.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use("/api/v1/products", productRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/orders", orderRoutes);

app.use(globalErrorHandler);

export default app;
