/**
 * Traceability middleware.
 * Generates and attaches a unique request ID to each incoming request for traceability.
 * This middleware enables end-to-end traceability across all components of the application,
 * allowing for effective debugging, monitoring, and auditing of requests.
 * 
 * Traceability Features:
 * 1. Unique Request ID Generation: UUID v4 for global uniqueness
 * 2. Request Header Propagation: X-Request-ID header in responses
 * 3. Request Logging: Detailed logging of incoming requests
 * 4. Response Logging: Logging of completed requests with status
 * 5. Context Preservation: Request ID attached to all log entries
 * 
 * Design Pattern: Request Context Enrichment
 * This middleware implements the Request Context Enrichment pattern,
 * adding valuable contextual information to requests for use by
 * downstream components.
 * 
 * Request ID Benefits:
 * - Correlation of log entries across services
 * - Debugging of complex request flows
 * - Audit trail generation
 * - Performance monitoring
 * - Error investigation
 * 
 * Implementation Details:
 * - Uses crypto.randomUUID() for UUID generation
 * - Attaches request ID to request object
 * - Adds request ID to response headers
 * - Logs request start and completion
 * - Captures request metadata
 * 
 * @file
 * @module middleware/traceability
 * @author ChatBot Backend Team
 * @since 1.0.0
 * @copyright 2025 ChatBot Project
 * @license MIT
 * @see {@link https://nodejs.org/api/crypto.html#crypto_crypto_randomuuid_options} Crypto UUID Generation
 * @see {@link https://expressjs.com/en/guide/writing-middleware.html} Express Middleware
 */

import logger from '../logger.js'
import crypto from 'crypto'

/**
 * Middleware to generate and attach a unique request ID to each incoming request.
 * This enables traceability across all components of the application.
 * 
 * Middleware Processing Flow:
 * 1. Generate unique request ID
 * 2. Attach ID to request object
 * 3. Add ID to response headers
 * 4. Log incoming request details
 * 5. Set up response completion logging
 * 6. Continue to next middleware
 * 
 * Request ID Characteristics:
 * - Universally unique (UUID v4)
 * - Cryptographically secure randomness
 * - Persistent across entire request lifecycle
 * - Available to all downstream components
 * 
 * Logging Strategy:
 * - Incoming request logged at INFO level
 * - Response completion logged at INFO level
 * - Request ID included in all log entries
 * - Key request metadata captured
 * 
 * Performance Considerations:
 * - UUID generation overhead
 * - Request/response logging impact
 * - Memory overhead for event listeners
 * - Synchronous operations only
 * 
 * @function traceabilityMiddleware
 * @param {Object} req - Express request object
 * @param {Object} req.method - HTTP method of the request
 * @param {Object} req.url - URL of the request
 * @param {Object} req.ip - IP address of the client
 * @param {Object} req.connection - Connection information
 * @param {Function} req.get - Function to get request headers
 * @param {Object} res - Express response object
 * @param {Function} res.setHeader - Function to set response headers
 * @param {Function} res.on - Function to register event listeners
 * @param {Function} next - Express next middleware function
 * @memberof module:middleware/traceability
 * @since 1.0.0
 * 
 * @example
 * // Use as Express middleware
 * app.use(traceabilityMiddleware);
 */
const traceabilityMiddleware = (req, res, next) => {
  // Generate a unique request ID using cryptographically secure random UUID
  // This ensures global uniqueness and prevents ID collisions
  // UUID v4 format provides 122 bits of randomness
  const requestId = crypto.randomUUID()
  
  // Attach the request ID to the request object for use by downstream components
  // This makes the ID available throughout the request processing lifecycle
  // All logging and auditing components can access this ID for correlation
  req.requestId = requestId
  
  // Add request ID to the response headers for client-side tracking
  // This allows clients to correlate requests with server logs
  // Useful for debugging and support scenarios
  res.setHeader('X-Request-ID', requestId)
  
  // Log the incoming request with its ID for traceability
  // Captures essential request metadata for monitoring and debugging
  // Includes client information for security analysis
  logger.info('Incoming request', {
    requestId,
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  })
  
  // Log the response when it's finished for complete request lifecycle tracking
  // Captures response status and timing information
  // Provides complete traceability from request to response
  res.on('finish', () => {
    logger.info('Request completed', {
      requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      statusMessage: res.statusMessage
    })
  })
  
  // Continue to next middleware in the chain
  // Indicates successful context enrichment
  next()
}

export default traceabilityMiddleware