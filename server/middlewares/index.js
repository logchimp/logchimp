function notFound(req, res, next) {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
}

// eslint-disable-next-line no-unused-vars
function errorHandler(error, req, res, next) {
  const { message, stack } = error;
  const status = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(status).json({
    status: {
			code: status,
			type: "error",
		},
		error: {
			message,
		},
    stack: process.env.NODE_ENV === 'production' ? '🥞' : stack,
  });
}

module.exports = {
  errorHandler,
  notFound,
};
