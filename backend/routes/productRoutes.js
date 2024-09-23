import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProduct,
  updateProduct,
} from "../controllers/productController.js";
import { protect, restrictTo } from "../controllers/authController.js";

const router = express.Router();

router
  .route("/")
  .post(protect, restrictTo("admin"), createProduct)
  .get(protect, getAllProducts);

router
  .route("/:id")
  .get(protect, getProduct)
  .delete(protect, restrictTo("admin"), deleteProduct)
  .patch(protect, restrictTo("admin"), updateProduct);

export default router;
