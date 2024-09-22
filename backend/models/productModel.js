import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A product must have a name"],
      maxLength: [
        200,
        "The name length should be less than or equal to 200 characters",
      ],
    },
    price: {
      type: Number,
      required: [true, "A product must have a price"],
      maxLength: [5, "The price of a product cannot exceed 5 digits"],
      min: [0, "A price cannot be negative"],
    },
    description: {
      type: String,
      required: [true, "A product must have a description"],
    },
    rating: {
      type: Number,
      default: 0,
    },
    images: [
      {
        public_id: {
          type: String,
          required: [true, "An image must have a public id"],
        },
        url: { type: String, required: [true, "An image must have a url"] },
      },
    ],
    category: {
      type: String,
      required: [true, "A product must belong to a category"],
      enum: {
        values: [
          "Electronics",
          "Cameras",
          "Laptops",
          "Accessories",
          "Food",
          "Headphones",
          "Books",
          "Sports",
          "Outdoor",
          "Home",
        ],
        message: "Please select a category",
      },
    },
    seller: {
      type: String,
      required: [true, "A product must have a seller"],
    },
    stock: {
      type: Number,
      required: [true, "A product must have a stock"],
      min: [0, "A price cannot be negative"],
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    creator: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      // required: [false, "A product must belong to a creator"],
    },
  },
  {
    timestamps: true,
    toObject: { virtual: true },
    toJSON: { virtual: true },
  }
);

productSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
});

const Product = mongoose.model("Product", productSchema);

export default Product;
