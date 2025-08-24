import logger from '../logger.js'

/**
 * Middleware function to log incoming requests and their responses.
 * Records request method, URL, status code, response time, user agent, and IP address.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, url, headers } = req;
    const { statusCode } = res;

    logger.info(`${method} ${url} ${statusCode} - ${duration}ms`, {
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
      userAgent: headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress,
      requestId: req.requestId
    });
  });

  next();
};

export default requestLogger;