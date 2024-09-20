import mongoose from "mongoose";

const connectDatabase = () => {
  let DB = "";
  if (process.env.NODE_ENV === "production") DB = process.env.DB_REMOTE_URI;
  if (process.env.NODE_ENV === "development") DB = process.env.DB_LOCAL_URI;

  mongoose
    .connect(DB)
    .then((connection) =>
      console.log(
        `connected to MongoDB database with host ${connection?.connection?.host}`
      )
    );
};

export default connectDatabase;
