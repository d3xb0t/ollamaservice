/**
 * Request logging middleware.
 * Logs incoming requests and their responses with detailed information.
 * This middleware provides comprehensive logging of HTTP requests and responses,
 * capturing performance metrics, request characteristics, and response outcomes.
 * 
 * Logging Capabilities:
 * 1. Request Details: Method, URL, headers, IP address
 * 2. Response Details: Status code, response time
 * 3. Performance Metrics: Request duration timing
 * 4. Client Information: User agent, IP address
 * 5. Traceability: Request ID correlation
 * 
 * Design Pattern: Observability Middleware
 * This middleware implements the Observability pattern,
 * providing insights into system behavior and performance
 * through structured logging of request/response cycles.
 * 
 * Log Entry Structure:
 * - Timestamp: ISO 8601 formatted timestamp
 * - Log Level: INFO for request logging
 * - Message: HTTP method, URL, status code, duration
 * - Metadata: Method, URL, status code, duration, user agent, IP, request ID
 * 
 * Performance Monitoring:
 * - Request duration calculation
 * - Status code tracking
 * - Request volume metrics
 * - Error rate monitoring
 * 
 * Security Considerations:
 * - Client IP address logging
 * - User agent string capture
 * - Request pattern analysis
 * - Audit trail generation
 * 
 * @file
 * @module middleware/logger
 * @author ChatBot Backend Team
 * @since 1.0.0
 * @copyright 2025 ChatBot Project
 * @license MIT
 * @see {@link https://expressjs.com/en/guide/writing-middleware.html} Express Middleware
 * @see {@link https://github.com/winstonjs/winston} Winston Logger
 */

/**
 * Request logging middleware.
 * Logs incoming requests and their responses.
 * @file
 * @module middleware/logger
 */

import logger from '../logger.js'

/**
 * Middleware function to log incoming requests and their responses.
 * Records request method, URL, status code, response time, user agent, and IP address.
 * 
 * Middleware Processing Flow:
 * 1. Record request start time
 * 2. Register response finish handler
 * 3. Calculate request duration
 * 4. Extract request/response details
 * 5. Format and log information
 * 6. Continue to next middleware
 * 
 * Timing Mechanism:
 * - Start time recorded when middleware executes
 * - End time recorded when response finishes
 * - Duration calculated in milliseconds
 * - High precision timing with Date.now()
 * 
 * Logged Information:
 * - HTTP method (GET, POST, etc.)
 * - Request URL (path and query)
 * - Response status code
 * - Request duration
 * - User agent string
 * - Client IP address
 * - Request ID for correlation
 * 
 * Performance Considerations:
 * - Minimal processing overhead
 * - Non-blocking event registration
 * - Efficient string formatting
 * - Asynchronous logging operations
 * 
 * @function requestLogger
 * @param {Object} req - Express request object
 * @param {string} req.method - HTTP method of the request
 * @param {string} req.url - URL of the request
 * @param {Object} req.headers - Request headers
 * @param {Function} req.get - Function to get request headers
 * @param {string} req.ip - IP address of the client
 * @param {Object} req.connection - Connection information
 * @param {string} req.requestId - Unique request identifier
 * @param {Object} res - Express response object
 * @param {number} res.statusCode - HTTP status code of the response
 * @param {Function} res.on - Function to register event listeners
 * @param {Function} next - Express next middleware function
 * @memberof module:middleware/logger
 * @since 1.0.0
 * 
 * @example
 * // Use as Express middleware
 * app.use(requestLogger);
 */
const requestLogger = (req, res, next) => {
  // Record the start time for request duration calculation
  // This timestamp is used to measure how long the request took to process
  // High precision timing using Date.now() in milliseconds
  const start = Date.now();

  // Register event listener for response completion
  // This handler executes when the response is finished sending to the client
  // Allows for accurate duration calculation and response logging
  res.on('finish', () => {
    // Calculate the total request duration in milliseconds
    // Difference between start time and current time
    // Provides performance metrics for request processing
    const duration = Date.now() - start;
    
    // Extract relevant information from request and response objects
    // Destructures commonly used properties for cleaner code
    // Avoids repeated property access for better performance
    const { method, url, headers } = req;
    const { statusCode } = res;

    // Log the request/response information using the application logger
    // Combines method, URL, status code, and duration in the log message
    // Includes structured metadata for detailed analysis
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

  // Continue to next middleware in the chain
  // Indicates successful logging setup without blocking request processing
  next();
};

export default requestLogger;