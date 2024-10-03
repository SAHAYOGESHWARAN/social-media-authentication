const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
  };
  
  const errorHandler = (err, req, res, next) => {
    // Log the error details for debugging
    console.error(err.stack);
  
    // Determine the status code
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
    // Create a structured error response
    const errorResponse = {
      status: 'error',
      statusCode,
      message: err.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }), // Show stack trace in development mode
    };
  
    // Handle specific error types if needed
    if (err.name === 'ValidationError') {
      errorResponse.errors = err.errors; // Include validation errors
      errorResponse.message = 'Validation Failed'; // Generalize the message
    }
  
    res.status(statusCode).json(errorResponse);
  };
  
  module.exports = { notFound, errorHandler };
  