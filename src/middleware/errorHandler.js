const ApiResponse = require('../utils/response');

class ErrorHandler {
  static notFound(req, res, next) {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
  }

  static globalErrorHandler(err, req, res, next) {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Mongoose validation error
    if (err.name === 'ValidationError') {
      statusCode = 400;
      const errors = Object.values(err.errors).map(error => ({
        field: error.path,
        message: error.message
      }));
      return ApiResponse.validationError(res, errors, 'Validation failed');
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
      statusCode = 409;
      const field = Object.keys(err.keyValue)[0];
      message = `${field} already exists`;
      return ApiResponse.conflict(res, message);
    }

    // Mongoose cast error
    if (err.name === 'CastError') {
      statusCode = 400;
      message = 'Invalid ID format';
      return ApiResponse.error(res, message, statusCode);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Invalid token';
      return ApiResponse.unauthorized(res, message);
    }

    if (err.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Token expired';
      return ApiResponse.unauthorized(res, message);
    }

    // Development vs Production error handling
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Stack:', err.stack);
      return res.status(statusCode).json({
        success: false,
        message,
        error: {
          name: err.name,
          message: err.message,
          stack: err.stack
        },
        timestamp: new Date().toISOString()
      });
    }

    // Production error response
    return ApiResponse.error(res, message, statusCode);
  }

  static asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }
}

module.exports = ErrorHandler;