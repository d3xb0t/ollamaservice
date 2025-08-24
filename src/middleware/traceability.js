/**
 * Traceability middleware.
 * Generates and attaches a unique request ID to each incoming request for traceability.
 * @file
 * @module middleware/traceability
 */

import logger from '../logger.js'
import crypto from 'crypto'

/**
 * Middleware to generate and attach a unique request ID to each incoming request.
 * This enables traceability across all components of the application.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const traceabilityMiddleware = (req, res, next) => {
  // Generate a unique request ID
  const requestId = crypto.randomUUID()
  
  // Attach the request ID to the request object
  req.requestId = requestId
  
  // Add request ID to the response headers for client-side tracking
  res.setHeader('X-Request-ID', requestId)
  
  // Log the incoming request with its ID
  logger.info('Incoming request', {
    requestId,
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  })
  
  // Log the response when it's finished
  res.on('finish', () => {
    logger.info('Request completed', {
      requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      statusMessage: res.statusMessage
    })
  })
  
  next()
}

export default traceabilityMiddleware