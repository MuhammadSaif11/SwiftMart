import mongoose from "mongoose";

const orderItemSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "The orderItem must have a name"],
    },
    price: {
      type: Number,
      required: [true, "The orderItem must have a price"],
    },
    quantity: {
      type: Number,
      required: [true, "The orderItem must have a quantity"],
    },
    image: {
      type: String,
      required: [true, "The orderItem must have a name"],
    },
    order: {
      type: mongoose.Schema.ObjectId,
      ref: "Order",
      required: [true, "The orderItem must belong to an order"],
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "The orderItem must belong to a product"],
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

// orderItemSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: "product",
//     select: "name price images category",
//   });
//   next();
// });

const OrderItem = mongoose.model("OrderItem", orderItemSchema);

export default OrderItem;
