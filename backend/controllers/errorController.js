import ErrorHandler from "../utils/ErrorHandler.js";

const sendProdError = (err, res) => {
  if (err.isOperational || err.isOperational === undefined) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

const sendDevError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const handleCastError = (err) => {
  const message = `invalid ${err.path} : ${err.value}`;
  return new ErrorHandler(message, 400);
};

const handleValidationError = (err) => {
  const message = err.message;
  return new ErrorHandler(message, 400);
};

const handleDuplicationError = (err) => {
  const message = `Duplicate field value: ${
    Object.keys(err.keyValue)[0]
  }. Please use another value`;
  return new ErrorHandler(message, 400);
};

export default (err, req, res, next) => {
  err.status = err.status || "error";
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === "production") {
    let error;

    if (err.name === "CastError") error = handleCastError(err);
    else if (err.name === "ValidationError") error = handleValidationError(err);
    else if (err.code === 11000) error = handleDuplicationError(err);

    sendProdError(error, res);
  } else if (process.env.NODE_ENV === "development") {
    sendDevError(err, res);
  }
};
