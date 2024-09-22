import express from "express";
import globalErrorHandler from "./controllers/errorController.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

app.use(express.json());

app.use("/api/v1/products", productRoutes);
app.use("/api/v1/users", userRoutes);

app.use(globalErrorHandler);

export default app;
