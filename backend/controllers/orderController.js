import Order from "../models/orderModel.js";
import OrderItem from "../models/orderItemModel.js";
import Product from "../models/productModel.js";
import catchAsync from "../utils/catchAsync.js";
import ErrorHandler from "../utils/ErrorHandler.js";
// import ApiFeatures from "../utils/ApiFeatures.js";

export const createOrder = catchAsync(async (req, res, next) => {
  const { orderItems, ...preOrder } = req.body;

  const order = await Order.create({ ...preOrder, user: req.user._id });

  try {
    for (const item of orderItems) {
      await OrderItem.create({ ...item, order: order._id });
    }
  } catch (error) {
    await Order.findByIdAndDelete(order._id);
    throw error;
  }

  const orderDetails = await Order.findById(order._id);

  res.status(201).json({
    status: "success",
    data: {
      order: orderDetails,
    },
  });
});

export const getOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req?.params?.id);

  if (!order)
    return next(
      new ErrorHandler(`Order not found with id ${req.params.id}`, 404)
    );

  res.status(200).json({
    status: "success",
    data: {
      order,
    },
  });
});

export const getUserOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });

  if (!orders)
    return next(
      new ErrorHandler(`Order not found with id ${req.params.id}`, 404)
    );

  res.status(200).json({
    status: "success",
    results: orders.results,
    data: {
      orders,
    },
  });
});

export const getAllOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find();

  res.status(200).json({
    status: "success",
    results: orders.length,
    data: {
      orders,
    },
  });
});

export const updateOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req?.params?.id);

  if (!order)
    return next(
      new ErrorHandler(`Order not found with id ${req.params.id}`, 404)
    );

  if (order.orderStatus === "Delivered")
    return next(new ErrorHandler(`You have already delivered this order`, 400));

  const { status } = req.body;

  if (status === "Shipped") {
    // order.orderItems.forEach(async (item) => {
    //   const product = await Product.findById(item.product._id);

    //   if (!product)
    //     return next(
    //       new ErrorHandler(
    //         `Product not found with this id ${item.product._id}`,
    //         404
    //       )
    //     );

    //   product.stock = product.stock - item.quantity;
    //   await product.save({ validateBeforeSave: false });
    // });

    const productsToUpdate = order.orderItems.map((item) => item.product);

    const products = await Product.find({ _id: { $in: productsToUpdate } });

    if (!products.length)
      return next(new ErrorHandler("Products not found", 404));

    order.orderItems.forEach((item) => {
      const product = products.find((prod) => prod._id.equals(item.product));

      if (!product)
        throw new ErrorHandler(
          `Product not found with id ${item.product}`,
          404
        );

      product.stock -= item.quantity;
    });

    await Promise.all(
      products.map((product) => product.save({ validateBeforeSave: false }))
    );
  }

  if (status === "Delivered") order.deliveredAt = Date.now();

  order.orderStatus = status;

  await order.save();

  res.status(200).json({
    status: "success",
    data: {
      order,
    },
  });
});

export const deleteOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findByIdAndDelete(req?.params?.id);

  if (!order)
    return next(
      new ErrorHandler(`Order not found with id ${req.params.id}`, 404)
    );

  res.status(204).json({
    status: "success",
    data: null,
  });
});
