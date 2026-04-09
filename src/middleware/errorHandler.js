const logger = require('../utils/logger');

module.exports = function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  logger.error('unhandled error', { message: err.message, stack: err.stack, path: req.path });
  res.status(status).json({
    error: status >= 500 ? 'Internal server error' : err.message
  });
};