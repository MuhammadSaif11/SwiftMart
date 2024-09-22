import dotenv from "dotenv";

process.on("uncaughtException", (err) => {
  console.log(err);
  console.error(err.name, err.message);
  console.log("UNCAUGHT EXCEPTION! SHUTTING DOWN");
  process.exit(1);
});

dotenv.config({ path: "backend/config/config.env" });
import app from "./app.js";
import connectDatabase from "./config/dbConnent.js";

connectDatabase();

const port = process.env.PORT || 8080;

const server = app.listen(port, () => {
  console.log(`listening on port ${port} in ${process.env.NODE_ENV} mode`);
});

process.on("unhandledRejection", (err) => {
  console.error(err.name, err.message);
  console.log("UNHANDLED REJECTION! SHUTTING DOWN");
  server.close(() => {
    process.exit(1);
  });
});
