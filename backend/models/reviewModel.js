import mongoose from "mongoose";
import Product from "../models/productModel.js";

const reviewSchema = mongoose.Schema(
  {
    comment: {
      type: String,
      required: [true, "A review must have a comment"],
    },
    rating: {
      type: Number,
      required: [true, "A review must have a rating"],
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "A review must belong to a product"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "A review must belong to a user"],
    },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

reviewSchema.statics.calculateProductRating = async function (product) {
  const stats = await this.aggregate([
    {
      $match: { product },
    },
    {
      $group: {
        _id: "$product",
        numOfReviews: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(product, {
      numOfReviews: stats[0].numOfReviews,
      rating: stats[0].avgRating.toFixed(2),
    });
  }
};

reviewSchema.post("save", function () {
  this.constructor.calculateProductRating(this.product);
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;
