const errorHandler = (
  err,
  req,
  res,
  next
) => {

  console.error(
    "Centralized Error:",
    err
  );

  // If a response was already sent,
  // pass the error to Express
  if (res.headersSent) {
    return next(err);
  }

  let statusCode =
    err.statusCode || 500;

  let message =
    err.message ||
    "Internal server error";


  // Invalid MongoDB ObjectId
  if (err.name === "CastError") {

    statusCode = 400;

    message =
      `Invalid ${err.path}`;

  }


  // Duplicate value
  if (err.code === 11000) {

    statusCode = 409;

    const field =
      Object.keys(
        err.keyValue || {}
      )[0];

    message =
      `${field || "Value"} already exists`;

  }


  // Mongoose validation error
  if (
    err.name ===
    "ValidationError"
  ) {

    statusCode = 400;

    message =
      Object.values(
        err.errors
      )
        .map(
          item => item.message
        )
        .join(", ");

  }


  // Expired JWT
  if (
    err.name ===
    "TokenExpiredError"
  ) {

    statusCode = 401;

    message =
      "Token expired. Please log in again.";

  }


  // Invalid JWT
  if (
    err.name ===
    "JsonWebTokenError"
  ) {

    statusCode = 401;

    message =
      "Invalid authentication token";

  }


  return res.status(
    statusCode
  ).json({

    success: false,

    message

  });

};


module.exports =
  errorHandler;