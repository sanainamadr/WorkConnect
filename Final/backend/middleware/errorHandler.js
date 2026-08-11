export const notFound = (req, res, next) => {
  const err = new Error(`Not Found - ${req.originalUrl}`);
  err.status = 404;
  next(err);
};

export const errorHandler = (err, req, res, next) => {
  const status = err.status || (res.statusCode !== 200 ? res.statusCode : 500);
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Log error (in production, send to logging service)
  if (isProduction) {
    // TODO: Send to error tracking service (Sentry, etc.)
    console.error('[ERROR]', {
      message: err.message,
      status,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
    });
  } else {
    console.error('[ERROR]', err);
  }
  
  // Don't expose internal errors in production
  const message = isProduction && status === 500
    ? 'Internal Server Error'
    : err.message || 'Internal Server Error';
  
  res.status(status).json({
    message,
    // hide stack in production
    stack: isProduction ? undefined : err.stack,
    // Include error ID for tracking in production
    ...(isProduction && { errorId: `ERR-${Date.now()}` }),
  });
};
