import Order from "../models/orderModel.js";
import OrderItem from "../models/orderItemModel.js";
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
      new ErrorHandler(`Order not found with id ${req.params.id}`),
      404
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
      new ErrorHandler(`Order not found with id ${req.params.id}`),
      404
    );

  res.status(200).json({
    status: "success",
    data: {
      orders,
    },
  });
});
