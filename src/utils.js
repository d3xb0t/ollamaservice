/**
 * Utility functions.
 * Contains helper functions used across the application.
 * This module provides commonly used utility functions that don't
 * fit into specific categories but are needed by multiple components.
 * 
 * Utility Categories:
 * 1. Error Handling: Async error wrapper
 * 2. Rate Limiting: Request rate limiting middleware
 * 3. Data Processing: Data transformation functions
 * 4. Validation: Helper validation functions
 * 
 * Design Pattern: Utility Module
 * This module implements the Utility Module pattern,
 * providing a collection of loosely related helper functions
 * in a single, easily accessible location.
 * 
 * Reusability:
 * - Functions designed for broad applicability
 * - Minimal dependencies
 * - Clear interfaces
 * - Comprehensive documentation
 * 
 * Maintenance:
 * - Centralized location for common functions
 * - Easy to update and modify
 * - Consistent across application
 * 
 * @file
 * @module utils
 * @author ChatBot Backend Team
 * @since 1.0.0
 * @copyright 2025 ChatBot Project
 * @license MIT
 */

import rateLimit from "express-rate-limit"

/**
 * Higher-order function that wraps an async route handler to catch any errors
 * and pass them to the next middleware.
 * This utility function solves the common problem of async/await error handling
 * in Express.js by automatically catching rejected promises and passing
 * the errors to the next middleware in the chain.
 * 
 * Problem Solved:
 * - Express.js does not automatically catch errors in async route handlers
 * - Unhandled promise rejections can crash the application
 * - Manual try/catch blocks are repetitive and error-prone
 * 
 * Solution Benefits:
 * - Automatic error catching
 * - Consistent error handling
 * - Reduced boilerplate code
 * - Improved code readability
 * 
 * Implementation Details:
 * - Higher-order function pattern
 * - Promise rejection handling
 * - Express middleware compatibility
 * - Transparent operation
 * 
 * @function asyncErrorHandler
 * @param {Function} func - The async route handler function
 * @returns {Function} A wrapper function that handles errors
 * @memberof module:utils
 * @since 1.0.0
 * 
 * @example
 * // Use with async route handler
 * const handler = asyncErrorHandler(async (req, res) => {
 *   // Async operations
 *   const result = await someAsyncOperation();
 *   res.json(result);
 * });
 * 
 * @example
 * // Register route with error handling
 * router.post('/chat', handler);
 */
export const asyncErrorHandler = (func) => {
    /**
     * Wrapper function that provides error handling for async route handlers.
     * This function has the standard Express middleware signature and
     * wraps the provided async function with error catching logic.
     * 
     * Middleware Signature:
     * - req: Express request object
     * - res: Express response object
     * - next: Express next function
     * 
     * Error Handling Process:
     * 1. Execute the wrapped async function
     * 2. Catch any promise rejections
     * 3. Pass errors to next() middleware
     * 
     * @param {express.Request} requests - The HTTP request object
     * @param {express.Response} response - The HTTP response object
     * @param {Function} next - The next middleware function
     * @returns {Promise<void>} Promise that resolves when handler completes
     */
    return (requests, response, next) => {
        /**
         * Execute the wrapped function and catch any errors.
         * The function is called with the standard Express parameters,
         * and any promise rejections are caught and passed to next().
         * 
         * Execution Flow:
         * 1. Call the async function with request/response/next
         * 2. If promise resolves, operation completes normally
         * 3. If promise rejects, catch passes error to next middleware
         */
        func(requests, response, next).catch(err => next(err)) 
    }
}

/**
 * Rate limiting middleware to control how many requests a user can make
 * within a specified time window.
 * This middleware protects the application from abuse and ensures
 * fair usage by limiting the number of requests from a single IP address.
 * 
 * Rate Limiting Benefits:
 * 1. Abuse Prevention: Stops brute force and DoS attacks
 * 2. Resource Protection: Prevents server overload
 * 3. Fair Usage: Ensures equitable resource distribution
 * 4. Service Stability: Maintains consistent performance
 * 
 * Configuration:
 * - Window: 1 minute
 * - Max Requests: 20 per window
 * - Custom Error Message: User-friendly error response
 * - Headers: Standard rate limit headers
 * 
 * Implementation:
 * - Uses express-rate-limit package
 * - Memory store (in-memory, not suitable for production clusters)
 * - IP-based limiting
 * - Configurable limits and messages
 * 
 * @type {Object}
 * @constant {Object}
 * @memberof module:utils
 * @since 1.0.0
 * 
 * @example
 * // Use as Express middleware
 * app.use(rateLimiter);
 * 
 * @example
 * // Apply to specific routes
 * router.use(rateLimiter);
 */
export const rateLimiter = rateLimit({
  /**
   * Time window for rate limiting in milliseconds.
   * Defines the duration over which requests are counted.
   * 
   * Window Calculation:
   * - 1 minute = 60 seconds = 60,000 milliseconds
   * - Requests reset after this period
   * - Sliding window algorithm
   * 
   * Time Considerations:
   * - Short windows: More responsive limits
   * - Long windows: Smoother request distribution
   * - Memory usage: Longer windows use more memory
   */
  windowMs: 1 * 60 * 1000, // 1 minuto
  
  /**
   * Maximum number of requests allowed per window.
   * Defines the request limit for each IP address.
   * 
   * Limit Selection:
   * - 20 requests per minute
   * - Balanced for typical API usage
   * - Prevents abuse without hindering legitimate use
   * 
   * Threshold Considerations:
   * - User experience: Sufficient for normal usage
   * - Security: Low enough to prevent abuse
   * - Performance: Not overly restrictive
   */
  max: 20,
  
  /**
   * Custom error message for rate limit exceeded.
   * Provides user-friendly feedback when rate limit is reached.
   * 
   * Message Design:
   * - Clear error indication
   * - Explanation of limit
   * - Guidance for next steps
   * 
   * Response Format:
   * - JSON object
   * - Error and message fields
   * - HTTP 429 status code (set by middleware)
   */
  message: {
    error: 'Límite de solicitudes excedido',
    message: 'Has realizado demasiadas solicitudes. Por favor, espera un momento.',
  },
  
  /**
   * Enable standard rate limit headers.
   * Adds RateLimit-* headers to responses for client information.
   * 
   * Header Information:
   * - RateLimit-Limit: Request limit
   * - RateLimit-Remaining: Requests remaining
   * - RateLimit-Reset: Time until limit reset
   * 
   * Client Benefits:
   * - Programmatic rate limit handling
   * - Proactive limit management
   * - Better user experience
   */
  standardHeaders: true, // Devuelve headers: RateLimit-*
  
  /**
   * Disable legacy rate limit headers.
   * Prevents use of deprecated X-RateLimit-* headers.
   * 
   * Header Standards:
   * - Modern RateLimit-* headers preferred
   * - X-RateLimit-* headers deprecated
   * - Consistent with current best practices
   * 
   * Compatibility:
   * - Modern client support
   * - Standards compliance
   * - Future-proof implementation
   */
  legacyHeaders: false, // No usar `X-RateLimit-*`
})