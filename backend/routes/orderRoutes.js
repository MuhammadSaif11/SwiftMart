import express from "express";
import {
  createOrder,
  deleteOrder,
  getAllOrders,
  getOrder,
  updateOrder,
} from "../controllers/orderController.js";
import { protect, restrictTo } from "../controllers/authController.js";

const router = express.Router();

router
  .route("/")
  .post(protect, createOrder)
  .get(protect, restrictTo("admin"), getAllOrders);

router
  .route("/:id")
  .get(protect, restrictTo("admin"), getOrder)
  .patch(protect, restrictTo("admin"), updateOrder)
  .delete(protect, restrictTo("admin"), deleteOrder);

export default router;
