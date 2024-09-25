import express from "express";
import { createOrder, getOrder, getUserOrders } from "../controllers/orderController.js";
import { protect, restrictTo } from "../controllers/authController.js";

const router = express.Router();

router.route("/").post(protect, createOrder).get(protect,getUserOrders);
router.route("/:id").get(protect, restrictTo("admin"), getOrder);

export default router;
