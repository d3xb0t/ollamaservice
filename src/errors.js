/**
 * Error handling utilities.
 * Defines custom error classes and a centralized error handler middleware.
 * This module provides a comprehensive error handling system for the application,
 * ensuring consistent error responses and proper error logging/auditing.
 * 
 * Error Handling Architecture:
 * 1. Custom Error Classes: Application-specific error types
 * 2. Error Handler Middleware: Centralized error processing
 * 3. Error Auditing: Persistent error logging for debugging
 * 4. Error Logging: Structured error reporting
 * 
 * Design Pattern: Error Handling Framework
 * This module implements a comprehensive error handling framework that
 * follows the Chain of Responsibility pattern for handling different error types.
 * 
 * Error Processing Flow:
 * 1. Error occurs in application code
 * 2. Error caught by Express.js or asyncErrorHandler
 * 3. Error passed to errorHandler middleware
 * 4. Error classified and processed
 * 5. Error logged and audited
 * 6. Appropriate HTTP response sent
 * 
 * @file
 * @module errors
 * @author ChatBot Backend Team
 * @since 1.0.0
 * @copyright 2025 ChatBot Project
 * @license MIT
 * @see {@link https://expressjs.com/en/guide/error-handling.html} Express Error Handling
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error} JavaScript Error
 */

import logger from './logger.js'
import auditError from './service/errorAudit.service.js'

/**
 * Custom error class for application-specific errors.
 * Extends the native JavaScript Error class to provide additional
 * context and metadata for application errors.
 * 
 * Error Classification:
 * - Client Errors (400-499): Invalid requests, validation errors
 * - Server Errors (500-599): Internal server errors, service failures
 * 
 * Error Properties:
 * - message: Human-readable error description
 * - statusCode: HTTP status code for response
 * - status: Error category ('fail' or 'error')
 * - isOperational: Boolean indicating if error is operational
 * 
 * Design Pattern: Custom Error Types
 * This pattern allows for specific error handling based on error types
 * while maintaining compatibility with native JavaScript errors.
 * 
 * @class
 * @extends Error
 * @memberof module:errors
 * @since 1.0.0
 * 
 * @example
 * // Create a new custom error
 * const error = new CustomError('Invalid input', 400);
 * 
 * @example
 * // Throw a custom error
 * throw new CustomError('Service unavailable', 503);
 */
export class CustomError extends Error{
    /**
     * Creates a new CustomError instance.
     * Initializes the error with a message and status code,
     * and sets additional properties for error classification.
     * 
     * Initialization Process:
     * 1. Call parent Error constructor with message
     * 2. Set statusCode property
     * 3. Determine status category based on statusCode
     * 4. Mark as operational error
     * 5. Capture stack trace
     * 
     * Status Classification:
     * - 400-499: 'fail' (client errors)
     * - 500+: 'error' (server errors)
     * 
     * @param {string} message - The error message.
     * @param {number} statusCode - The HTTP status code associated with the error.
     * @memberof module:errors.CustomError
     * @since 1.0.0
     * 
     * @example
     * // Create a validation error
     * const validationError = new CustomError('Invalid email format', 400);
     * 
     * @example
     * // Create a service error
     * const serviceError = new CustomError('Database connection failed', 500);
     */
    constructor(message, statusCode){
        super(message)
        this.statusCode = statusCode
        this.status = statusCode >= 404 && statusCode < 500 ? 'fail':'error'

        this.isOperational = true
        Error.captureStackTrace(this, this.constructor)
    }
}

/**
 * Centralized error handling middleware.
 * Catches errors thrown in the application and sends appropriate responses.
 * This is the final error handler in the Express middleware chain,
 * responsible for processing all unhandled errors and ensuring consistent responses.
 * 
 * Error Handling Strategy:
 * 1. Audit the error for debugging purposes
 * 2. Log the error with appropriate severity
 * 3. Classify the error type
 * 4. Send appropriate HTTP response
 * 
 * Error Classification:
 * - ZodError: Validation errors from Zod schema validation
 * - Connection Errors: Network/service connectivity issues
 * - General Errors: All other unhandled errors
 * 
 * Response Strategy:
 * - Client errors (4xx): Detailed error information
 * - Server errors (5xx): Generic error messages for security
 * 
 * Design Pattern: Chain of Responsibility
 * This middleware uses a chain of handlers to process different error types,
 * with each handler responsible for a specific error category.
 * 
 * @function errorHandler
 * @param {Error} error - The error object.
 * @param {express.Request} request - The Express request object.
 * @param {express.Response} response - The Express response object.
 * @param {Function} next - The next middleware function.
 * @memberof module:errors
 * @since 1.0.0
 * 
 * @example
 * // Use as Express middleware
 * app.use(errorHandler);
 */
export const errorHandler = (error, request, response, next) => {
    const {
        statusCode = 500,
        message = 'An unexpected error occurred',
    } = error
    
    // Audit the error for debugging and monitoring purposes
    // This persists error information to the database for later analysis
    // Even if auditing fails, the main error flow continues
    auditError({
        requestId: request.requestId,
        error,
        request
    }).catch(auditError => {
        // Log audit failure but don't interrupt main error flow
        // This ensures that audit system failures don't impact error handling
        logger.error('Failed to audit error', {
            error: auditError.message,
            requestId: request.requestId
        })
    })
    
    // Log the error with appropriate severity based on status code
    // Server errors (5xx) are logged as errors
    // Client errors (4xx) are logged as warnings
    if (statusCode >= 500) {
        logger.error('Application error', {
            error: error.message,
            stack: error.stack,
            url: request.url,
            method: request.method,
            statusCode: error.statusCode,
            requestId: request.requestId
        })
    } else {
        logger.warn('Operational error', {
            error: error.message,
            url: request.url,
            method: request.method,
            statusCode: error.statusCode,
            requestId: request.requestId
        })
    }
    
    /**
     * Map of error handlers for different error types.
     * Each entry contains a condition function and a handler function.
     * The first matching handler will be used to process the error.
     * 
     * Handler Structure:
     * - Condition: Function that determines if handler applies to error
     * - Handler: Function that processes the error and sends response
     * 
     * Error Types Handled:
     * - ZodError: Validation errors from schema validation
     * - Connection Errors: Network/service connectivity issues
     * - General Errors: Fallback for all other errors
     * 
     * @type {Map}
     * @constant {Map}
     * @memberof module:errors.errorHandler
     * @since 1.0.0
     */
    const errorHandlers = new Map([
        [
            /**
             * Condition function for Zod validation errors.
             * Checks if the error is a ZodError, which occurs during schema validation.
             * 
             * ZodError Characteristics:
             * - name: 'ZodError'
             * - issues: Array of validation issues
             * - Each issue has path, message, and code properties
             * 
             * @param {Error} err - The error to check
             * @returns {boolean} True if error is a ZodError
             */
            (err) => err.name === 'ZodError',
            /**
             * Handler function for Zod validation errors.
             * Processes validation errors and sends appropriate response.
             * 
             * Response Format:
             * - Status: 400 Bad Request
             * - Body: JSON with error details
             * - Details: Array of field-specific validation errors
             * 
             * @param {Error} err - The ZodError to handle
             * @returns {express.Response} The response object
             */
            (err) => {
                const validationErrors = err.issues.map(issue => ({
                    field: issue.path.join('.'),
                    message: issue.message
                }));

                return response.status(400).json({
                    status: 'error',
                    error: 'Invalid request body',
                    details: validationErrors,
            
                })
            }
        ],
        [
            /**
             * Condition function for connection errors.
             * Checks if the error is caused by a connection refusal,
             * which typically indicates a service is unavailable.
             * 
             * Connection Error Characteristics:
             * - cause: Object with code property
             * - cause.code: 'ECONNREFUSED' for connection refusal
             * - Common with database, external APIs, or services
             * 
             * @param {Error} err - The error to check
             * @returns {boolean} True if error is a connection error
             */
            (err) => (err.cause?.code === 'ECONNREFUSED'),
            /**
             * Handler function for connection errors.
             * Processes connection errors and sends appropriate response.
             * 
             * Response Format:
             * - Status: 503 Service Unavailable
             * - Body: JSON with service unavailable message
             * 
             * @param {Error} err - The connection error to handle
             * @returns {express.Response} The response object
             */
            (err) => {
                return response.status(503).json({
                    status: 'error',
                    error: `Ollama, Service Unavailable: ${err.message}`,
                })
            }
        ],
        [
            /**
             * Fallback condition function for all other errors.
             * This handler matches any error that hasn't been handled by previous handlers.
             * 
             * Fallback Strategy:
             * - Uses error's statusCode or defaults to 500
             * - Uses error's message or defaults to generic message
             * - Provides consistent error response format
             * 
             * @param {Error} err - The error to check (unused)
             * @returns {boolean} Always true (fallback handler)
             */
            () => true,
            /**
             * Handler function for all other errors.
             * Processes general errors and sends appropriate response.
             * 
             * Response Format:
             * - Status: Error's statusCode or 500
             * - Body: JSON with error message
             * 
             * @param {Error} err - The error to handle
             * @returns {express.Response} The response object
             */
            (err) => {
                return response.status(statusCode).json({
                    status: 'error',
                    error: message,
                })
            }
        ]
    ])

    // Find and execute the appropriate error handler
    // Iterates through the error handlers map to find a matching condition
    // Executes the corresponding handler function
    const matchedHandler = Array.from(errorHandlers.entries())
        .find(([condition]) => condition(error))

    // Execute the matched handler if one was found
    // This sends the appropriate HTTP response to the client
    if (matchedHandler) {
        const [_, handler] = matchedHandler
        handler(error)
    }
}