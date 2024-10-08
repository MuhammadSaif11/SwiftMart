import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A user must have a name"],
      maxLength: [50, "name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "A user must have a email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "please provide a valid email"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    password: {
      type: String,
      required: [true, "A user must have a password"],
      minLength: [8, "password must be at least 8 characters"],
      select: false,
    },
    confirmPassword: {
      type: String,
      required: [true, "A user must have a confirm password"],
      select: false,
      validate: {
        validator: function (value) {
          return this.password === value;
        },
        message: "password does not match with password confirmation",
      },
    },
    passwordChangedAt: {
      type: Date,
      select: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    avatar: {
      public_id: String,
      url: String,
    },
    loginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    lockUntil: {
      type: Date,
      select: false,
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1;
  next();
});

userSchema.pre(/find/, function (next) {
  this.find({ active: true });
  next();
});

userSchema.methods.matchPassword = async (candidatePassword, userPassword) =>
  await bcrypt.compare(candidatePassword, userPassword);

userSchema.methods.passwordChangedAfter = async function (jwtIssuedAt) {
  const user = await this.constructor
    .findById(this._id)
    .select("+passwordChangedAt");

  if (user.passwordChangedAt) {
    const changedTimestamp = parseInt(
      user.passwordChangedAt.getTime() / 1000,
      10
    );
    return changedTimestamp > jwtIssuedAt;
  }
  return false;
};

userSchema.methods.createResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpires = Date.now() + 30 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);

export default User;
