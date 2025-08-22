import logger from './logger.js'
/**
 * Custom error class that extends the built-in Error class.
 * Provides additional properties for error handling and categorization.
 * @extends Error
 * @example
 * // Create a new CustomError with a message and status code
 * const error = new CustomError('Something went wrong', 500)
 * console.log(error.message) // 'Something went wrong'
 * console.log(error.statusCode) // 500
 * console.log(error.status) // 'error'
 * console.log(error.isOperational) // true
 */
export class CustomError extends Error{
    /**
     * Create a CustomError.
     * @param {string} message - The error message
     * @param {number} statusCode - The HTTP status code associated with the error
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
 * Global error handling middleware function.
 * Handles errors and sends appropriate responses based on error type.
 * @param {Error} error - The error object
 * @param {Object} request - The HTTP request object
 * @param {Object} response - The HTTP response object
 * @param {Function} next - The next middleware function
 * @returns {Object} The response object with error details
 */
export const errorHandler = (error, request, response, next) => {
    const {
        statusCode = 500,
        message = 'An unexpected error occurred',
    } = error
    
    // Log the error with stack trace for debugging
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
        // Log operational errors as warnings
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
     * @type {Map<Function, Function>}
     */
    const errorHandlers = new Map([
        [
            // Caso 1: Error de validación de Zod
            (err) => err.name === 'ZodError',
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
             * Condition function to check for ECONNREFUSED errors.
             * @param {Error} err - The error object to check
             * @returns {boolean} True if the error is an ECONNREFUSED error
             */
            (err) => (err.cause?.code === 'ECONNREFUSED'),
            /**
             * Handler function for ECONNREFUSED errors.
             * @param {Error} err - The ECONNREFUSED error object
             * @returns {Object} JSON response with 503 status and service unavailable message
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
             * Default condition function that always returns true.
             * @returns {boolean} Always returns true to match any error
             */
            // Default case: Other errors
            () => true, // Always matches
            /**
             * Default handler function for all other errors.
             * @param {Error} err - The error object
             * @returns {Object} JSON response with error status and message
             */
            (err) => {
                return response.status(statusCode).json({
                    status: 'error',
                    error: message,
                })
            }
        ]
    ])

    /**
     * Find the first handler that matches the error.
     * @type {Array|undefined}
     */
    // Find the first handler that matches the error
    const matchedHandler = Array.from(errorHandlers.entries())
        .find(([condition]) => condition(error))

    /**
     * Execute the corresponding handler if a match is found.
     */
    // Execute the corresponding handler
    if (matchedHandler) {
        const [_, handler] = matchedHandler
        handler(error)
    }
}