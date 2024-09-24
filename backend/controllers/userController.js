import User from "../models/UserModel.js";
import catchAsync from "../utils/catchAsync.js";
import ErrorHandler from "../utils/ErrorHandler.js";

export const getUserProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().select("+active");

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

export const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req?.params?.id).select("+active");

  if (!user)
    return next(
      new ErrorHandler(`User not found with id ${req.params.id}`, 404)
    );

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

export const updateMe = catchAsync(async (req, res, next) => {
  const { email, name } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { email, name },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

export const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

export const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req?.params?.id);

  if (!user)
    return next(
      new ErrorHandler(`User not found with id ${req.params.id}`, 404)
    );

  res.status(204).json({
    status: "success",
    data: null,
  });
});

export const updateUser = catchAsync(async (req, res, next) => {
  const { role } = req.body;
  const user = await User.findByIdAndUpdate(
    req?.params?.id,
    { role },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!user)
    return next(
      new ErrorHandler(`User not found with id ${req.params.id}`, 404)
    );

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});
