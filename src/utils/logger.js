const { createLogger, format, transports } = require('winston');
const { combine, timestamp, json, colorize, simple, errors } = format;

const isDev = process.env.NODE_ENV !== 'production';

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: isDev
    ? combine(errors({ stack: true }), colorize(), simple())
    : combine(errors({ stack: true }), timestamp(), json()),
  transports: [new transports.Console()]
});

module.exports = logger;