import Product from "../models/productModel.js";
import Review from "../models/reviewModel.js";
import catchAsync from "../utils/catchAsync.js";
import ErrorHandler from "../utils/ErrorHandler.js";

export const createProductReview = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { comment, rating } = req.body;

  const rev = await Review.findOne({ product: id, user: req.user._id });

  if (rev)
    return next(
      new ErrorHandler("You have already gave review on this product", 400)
    );

  const review = await Review.create({
    comment,
    rating,
    product: id,
    user: req.user._id,
  });

  //   await Product.findByIdAndUpdate(id, { $inc: { numOfReviews: 1 } });

  res.status(201).json({
    status: "success",
    data: {
      review,
    },
  });
});

export const updateProductReview = catchAsync(async (req, res, next) => {
  const { id, revId } = req.params;
  const { comment, rating } = req.body;

  const review = await Review.findByIdAndUpdate(revId, { comment, rating });

  if (!review)
    return next(
      new ErrorHandler(`review not found with this id ${revId}`, 404)
    );

  //   await Product.findByIdAndUpdate(id, { $inc: { numOfReviews: 1 } });

  res.status(200).json({
    status: "success",
    data: {
      review,
    },
  });
});
