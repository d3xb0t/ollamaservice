import logger from '../logger.js'

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
    });
  });

  next();
};

export default requestLogger;