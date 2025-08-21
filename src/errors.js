/**
 * Custom error class that extends the built-in Error class.
 * Provides additional properties for error handling and categorization.
 * @extends Error
 * @example
 * // Create a new CustomError with a message and status code
 * const error = new CustomError('Something went wrong', 500);
 * console.log(error.message); // 'Something went wrong'
 * console.log(error.statusCode); // 500
 * console.log(error.status); // 'error'
 * console.log(error.isOperational); // true
 */
export class CustomError extends Error{
    /**
     * Create a CustomError.
     * @param {string} message - The error message
     * @param {number} statusCode - The HTTP status code associated with the error
     */
    constructor(message, statusCode){
        super(message);
        this.statusCode = statusCode;
        this.status = statusCode >= 404 && statusCode < 500 ? 'fail':'error';

        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}