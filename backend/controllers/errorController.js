import ErrorHandler from "../utils/ErrorHandler.js";

const sendProdError = (err, res) => {
  if (err?.isOperational) {
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

const handleInvalidTokenError = (err) => {
  const message = "Invalid Token! Please Login Again!";
  return new ErrorHandler(message, 401);
};

const handleExpiredTokenError = (err) => {
  const message = "Expired Token! Please Login Again!";
  return new ErrorHandler(message, 401);
};

export default (err, req, res, next) => {
  err.status = err.status || "error";
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === "production") {
    let error;

    if (err.name === "CastError") error = handleCastError(err);
    else if (err.name === "ValidationError") error = handleValidationError(err);
    else if (err.code === 11000) error = handleDuplicationError(err);
    else if (
      err.name === "JsonWebTokenError" ||
      err.name === "InvalidTokenError" ||
      err.name === "TokenMalformedError"
    )
      error = handleInvalidTokenError(err);
    else if (err.name === "TokenExpiredError")
      error = handleExpiredTokenError(err);

    sendProdError(error, res);
  } else if (process.env.NODE_ENV === "development") {
    sendDevError(err, res);
  }
};
