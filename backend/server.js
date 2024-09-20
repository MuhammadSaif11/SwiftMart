import dotenv from "dotenv";
dotenv.config({ path: "backend/config/config.env" });
import app from "./app.js";
import connectDatabase from "./config/dbConnent.js";

connectDatabase();

const port = process.env.PORT || 8080;

const server = app.listen(port, () => {
  console.log(`listening on port ${port} in ${process.env.NODE_ENV} mode`);
});
