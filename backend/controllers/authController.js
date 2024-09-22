import catchAsync from "../utils/catchAsync.js";
import { promisify } from "util";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";

const generateToken = async (id) =>
  await promisify(jwt.sign)({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const sendToken = async (res, user, statusCode) => {
  const token = await generateToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: "Strict",
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.status(statusCode).cookie("jwt", token, cookieOptions).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

export const signup = catchAsync(async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;
  const user = await User.create({ name, email, password, confirmPassword });

  const createdUser = {
    name: user.name,
    email: user.email,
    role: user.role,
    _id: user._id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  await sendToken(res, createdUser, 201);

  // res.status(201).json({
  //   status: "success",
  //   data: {
  //     user: response,
  //   },
  // });
});
