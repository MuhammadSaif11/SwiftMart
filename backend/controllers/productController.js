import Product from "../models/productModel.js";
import catchAsync from "../utils/catchAsync.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import ApiFeatures from "../utils/ApiFeatures.js";

export const createProduct = catchAsync(async (req, res, next) => {
  const product = await Product.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      product,
    },
  });
});

export const getAllProducts = catchAsync(async (req, res, next) => {
  const apiFilters = new ApiFeatures(Product, req.query)
    .filter()
    .sort()
    .select()
    .paginataion();
  const products = await apiFilters.query;

  res.status(200).json({
    status: "success",
    results: products.length,
    data: {
      products,
    },
  });
});

export const getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req?.params?.id);

  if (!product)
    return next(
      new ErrorHandler(`Product not found with id ${req?.params?.id}`, 404)
    );

  res.status(200).json({
    status: "success",
    data: {
      product,
    },
  });
});

export const updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req?.params?.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product)
    return next(
      new ErrorHandler(`Product not found with id ${req?.params?.id}`, 404)
    );

  res.status(200).json({
    status: "success",
    data: {
      product,
    },
  });
});

export const deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req?.params?.id);

  if (!product)
    return next(
      new ErrorHandler(`Product not found with id ${req?.params?.id}`, 404)
    );

  res.status(204).json({
    status: "success",
    data: null,
  });
});
