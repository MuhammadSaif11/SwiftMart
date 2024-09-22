import mongoose from "mongoose";
import Product from "../models/productModel.js";
import products from "./data.js";

const seedProducts = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/swift-mart");

    await Product.deleteMany();
    console.log("deleted products");

    await Product.insertMany(products);
    console.log("added products");

    process.exit();
  } catch (error) {
    console.log(error.message);
    process.exit();
  }
};

seedProducts();
