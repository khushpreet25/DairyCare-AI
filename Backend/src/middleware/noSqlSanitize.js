const sanitizeObject = (data) => {

  if (!data || typeof data !== "object") {
    return;
  }

  for (const key of Object.keys(data)) {

    // Remove MongoDB operators
    if (
      key.startsWith("$") ||
      key.includes(".")
    ) {
      delete data[key];
      continue;
    }

    // Check nested objects
    sanitizeObject(data[key]);
  }

};


const noSqlSanitize = (
  req,
  res,
  next
) => {

  sanitizeObject(req.body);

  sanitizeObject(req.params);

  next();

};


module.exports =
  noSqlSanitize;