import catchAsync from "../utils/catchAsync.js";
import ErrorHandler from "../utils/ErrorHandler.js";
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
    // httpOnly: true,
    sameSite: "Strict",
    secure: process.env.NODE_ENV === "production",
  };

  res.status(statusCode).cookie("jwt", token, cookieOptions).json({
    status: "success",
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
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new ErrorHandler("Please provide a valid email and password"));

  const user = await User.findOne({ email }).select(
    "+password +loginAttempts +lockUntil"
  );

  if (!user) return next(new ErrorHandler(`Invalid email or password`, 401));

  if (user.lockUntil && user.lockUntil >= Date.now())
    return next(
      new ErrorHandler(`Account is temporarily blocked, Try again Later!`, 423)
    );

  if (!(await user.matchPassword(password, user.password))) {
    user.loginAttempts = user.loginAttempts + 1;

    if (user.loginAttempts >= process.env.MAX_LOGIN_ATTEMPTS) {
      user.lockUntil = Date.now() + process.env.LOCK_TIME * 60 * 60 * 1000;
      user.loginAttempts = 0;
    }

    await user.save();
    return next(new ErrorHandler(`invalid email or password`, 401));
  }

  user.loginAttempts = 0;
  user.lockUntil = undefined;
  await user.save();

  user.loginAttempts = undefined;
  user.password = undefined;

  sendToken(res, user, 200);
});

export const protect = catchAsync(async (req, res, next) => {
  let token;

  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token)
    return next(
      new ErrorHandler("You are not logged in. Please login first.", 401)
    );

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);

  if (!currentUser)
    return next(
      new ErrorHandler("The user belonging to this token is not valid.", 401)
    );

  if (currentUser.passwordChangedAfter(decoded.iat))
    return next(
      new ErrorHandler(
        "The user belonging to this token has changed his password. Please login again.",
        401
      )
    );

  req.user = currentUser;

  next();
});

export const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler("You are not authorized to access this resource.", 403)
      );
    }

    next();
  };

export const logout = (req, res, next) => {
  res.cookie("jwt", null, {
    expires: new Date(0),
    httpOnly: true,
    sameSite: "Strict",
    secure: process.env.NODE_ENV === "production",
  });

  res.status(200).json({
    status: "success",
    message: "User logged out successfully",
  });
};
