import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProduct,
  updateProduct,
} from "../controllers/productController.js";

const router = express.Router();

router.route("/").post(createProduct).get(getAllProducts);
router.route("/:id").get(getProduct).delete(deleteProduct).patch(updateProduct);

export default router;
