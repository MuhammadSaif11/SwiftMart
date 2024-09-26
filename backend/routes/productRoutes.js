import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProduct,
  updateProduct,
} from "../controllers/productController.js";
import { protect, restrictTo } from "../controllers/authController.js";
import { createProductReview } from "../controllers/reviewController.js";

const router = express.Router();

router
  .route("/")
  .post(protect, restrictTo("admin"), createProduct)
  .get(getAllProducts);

router
  .route("/:id")
  .get(getProduct)
  .delete(protect, restrictTo("admin"), deleteProduct)
  .patch(protect, restrictTo("admin"), updateProduct);

router.route("/:id/reviews").post(protect, createProductReview);

export default router;
