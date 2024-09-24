import catchAsync from "../utils/catchAsync.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { promisify } from "util";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import sendEmail from "../utils/sendEmail.js";
import { getResetPasswordTemplate } from "../utils/emailTemplate.js";
import crypto from "crypto";

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
    secure: process.env.NODE_ENV === "production",
  };

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
    return next(new ErrorHandler(`Invalid email or password`, 401));
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
      new ErrorHandler("The user belonging to this token does not exist.", 401)
    );

  if (await currentUser.passwordChangedAfter(decoded.iat))
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

export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email)
    return next(new ErrorHandler("Please provide a valid email!", 400));

  const user = await User.findOne({ email });

  if (!user)
    return next(
      new ErrorHandler(`User does not exist with this email ${email}`, 404)
    );

  const resetToken = user.createResetToken();

  await user.save();

  const url = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const options = {
    email: user.email,
    subject: `Reset Password Request`,
    message: getResetPasswordTemplate(user.name, url),
  };

  try {
    await sendEmail(options);

    res.status(200).json({
      status: "success",
      message: `Reset url successfully send to ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    return next(
      new ErrorHandler(
        "There was an error sending the email. Please try again later!",
        500
      )
    );
  }
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const { resetToken } = req.params;

  if (!resetToken) return next(new ErrorHandler("Invalid URl", 400));

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gte: Date.now() },
  });

  if (!user)
    return next(
      new ErrorHandler("The link is invalid or expired! Please try again", 400)
    );

  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword)
    return next(
      new ErrorHandler("Please provide password and confirm password", 400)
    );

  user.password = password;
  user.confirmPassword = confirmPassword;
  user.resetPasswordExpires = undefined;
  user.resetPasswordToken = undefined;
  await user.save();

  user.password = undefined;
  user.passwordChangedAt = undefined;

  sendToken(res, user, 200);
});

export const updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmNewPassword)
    return next(
      new ErrorHandler(
        "Please provide current, new and confirm password values",
        400
      )
    );

  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.matchPassword(currentPassword, user.password)))
    return next(new ErrorHandler("Invalid password", 401));

  user.password = newPassword;
  user.confirmPassword = confirmNewPassword;
  await user.save();

  user.password = undefined;
  user.passwordChangedAt = undefined;

  sendToken(res, user, 200);
});
