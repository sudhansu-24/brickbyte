const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Handle Supabase Auth errors
  if (err.name === 'AuthApiError' || err.name === 'AuthError') {
    return res.status(401).json({
      error: 'Authentication failed',
      details: err.message
    });
  }

  // Handle Supabase Database errors
  if (err.code && err.code.startsWith('PGRST')) {
    return res.status(400).json({
      error: 'Database error',
      details: err.message,
      code: err.code
    });
  }

  // Handle JWT errors
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Invalid or expired token',
      details: err.message
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.message
    });
  }

  // Handle network errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
    return res.status(503).json({
      error: 'Service unavailable',
      details: 'Unable to connect to the database'
    });
  }

  // Default error
  res.status(500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler; 