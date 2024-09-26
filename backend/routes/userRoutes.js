import express from "express";
import {
  login,
  logout,
  signup,
  forgotPassword,
  resetPassword,
  protect,
  updatePassword,
  restrictTo,
} from "../controllers/authController.js";
import {
  deleteMe,
  deleteUser,
  getAllUsers,
  getUser,
  getUserProfile,
  updateMe,
  updateUser,
} from "../controllers/userController.js";
import { getUserOrders } from "../controllers/orderController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:resetToken", resetPassword);
router.patch("/updatePassword", protect, updatePassword);

router.get("/me", protect, getUserProfile);
router.patch("/updateMe", protect, updateMe);
router.delete("/deleteMe", protect, deleteMe);

router.use(protect, restrictTo("admin"));
router.get("/", getAllUsers);
router.route("/:id").get(getUser).delete(deleteUser).patch(updateUser);

router.get("/me/orders", protect, getUserOrders);

export default router;
