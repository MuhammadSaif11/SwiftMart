import mongoose from "mongoose";

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      required: [true, "The order must belong to a user"],
      ref: "User",
    },
    shippingInfo: {
      address: {
        type: String,
        required: [true, "The order must have a shipping address"],
      },
      phoneNo: {
        type: String,
        required: [true, "The order must have a shipping phone number"],
      },
      zipCode: {
        type: String,
        required: [true, "The order must have a shipping zip code"],
      },
      city: {
        type: String,
        required: [true, "The order must have a shipping city"],
      },
      country: {
        type: String,
        required: [true, "The order must have a shipping country"],
      },
    },
    paymentMethod: {
      type: String,
      required: [true, "please select a payment method"],
      enum: {
        values: ["COD", "Card"],
        message: "please select: COD(cash on delivery) or Card",
      },
    },
    paymentInfo: {
      id: String,
      status: String,
    },
    itemsPrice: {
      type: Number,
      required: [true, "the order must have a total items price"],
    },
    taxAmount: {
      type: Number,
      required: [true, "the order must have a tax amount"],
    },
    shippingAmount: {
      type: Number,
      required: [true, "the order must have a shipping amount"],
    },
    totalAmount: {
      type: Number,
      required: [true, "the order must have a total amount"],
    },
    orderStatus: {
      type: String,
      enum: {
        values: ["Processing", "Shipped", "Delivered"],
        message: "please select correct order status",
      },
      default: "Processing",
    },
    deliveredAt: { type: Date },
  },
  { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } }
);

orderSchema.virtual("orderItems", {
  ref: "OrderItem",
  foreignField: "order",
  localField: "_id",
});

orderSchema.pre(/^find/, function (next) {
  this.populate({
    path: "orderItems",
    // select: "order",
  }).populate({
    path: "user",
    select: "name email",
  });

  next();
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
