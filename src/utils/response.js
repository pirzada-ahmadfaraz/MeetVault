class ApiResponse {
  static success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  static error(res, message = 'Internal Server Error', statusCode = 500, errors = null) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString()
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }

  static validationError(res, errors, message = 'Validation failed') {
    return this.error(res, message, 400, errors);
  }

  static notFound(res, message = 'Resource not found') {
    return this.error(res, message, 404);
  }

  static unauthorized(res, message = 'Unauthorized access') {
    return this.error(res, message, 401);
  }

  static forbidden(res, message = 'Access forbidden') {
    return this.error(res, message, 403);
  }

  static conflict(res, message = 'Conflict occurred') {
    return this.error(res, message, 409);
  }

  static created(res, data = null, message = 'Created successfully') {
    return this.success(res, data, message, 201);
  }

  static paginated(res, data, totalCount, page, limit, message = 'Data retrieved successfully') {
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPrevPage
      },
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = ApiResponse;