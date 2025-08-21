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
    // Define error handlers in a Map
    const errorHandlers = new Map([
        [
            err => (error.cause.code === 'ECONNREFUSED'),
            (err) => {
                return response.status(statusCode).json({
                    status: 'error',
                    error: `Ollama, Service Unavailable: ${err.message}`,
                })
            }
        ],
        [
            // Default case: Other errors
            () => true, // Always matches
            (err) => {
                return response.status(statusCode).json({
                    status: 'error',
                    error: message,
                })
            }
        ]
    ])

    // Find the first handler that matches the error
    const matchedHandler = Array.from(errorHandlers.entries())
        .find(([condition]) => condition(error))

    // Execute the corresponding handler
    if (matchedHandler) {
        const [_, handler] = matchedHandler
        handler(error)
    }
}