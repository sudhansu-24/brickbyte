const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const errorResponse = (res, error, statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    error: error.message || error
  });
};

module.exports = {
  successResponse,
  errorResponse
};
