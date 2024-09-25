import mongoose from "mongoose";

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

const Review = mongoose.model("Review", reviewSchema);

export default Review;
