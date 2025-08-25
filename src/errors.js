/**
 * Error handling utilities.
 * Defines custom error classes and a centralized error handler middleware.
 * @file
 * @module errors
 */

import logger from './logger.js'
import auditError from './service/errorAudit.service.js'

/**
 * Custom error class for application-specific errors.
 * @class
 * @extends Error
 */
export class CustomError extends Error{
    /**
     * Creates a new CustomError instance.
     * @param {string} message - The error message.
     * @param {number} statusCode - The HTTP status code associated with the error.
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
 * @param {Error} error - The error object.
 * @param {express.Request} request - The Express request object.
 * @param {express.Response} response - The Express response object.
 * @param {Function} next - The next middleware function.
 */
export const errorHandler = (error, request, response, next) => {
    const {
        statusCode = 500,
        message = 'An unexpected error occurred',
    } = error
    
    // Audit the error
    auditError({
        requestId: request.requestId,
        error,
        request
    }).catch(auditError => {
        // Log audit failure but don't interrupt main error flow
        logger.error('Failed to audit error', {
            error: auditError.message,
            requestId: request.requestId
        })
    })
    
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
    
    const errorHandlers = new Map([
        [
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
            (err) => (err.cause?.code === 'ECONNREFUSED'),
            (err) => {
                return response.status(503).json({
                    status: 'error',
                    error: `Ollama, Service Unavailable: ${err.message}`,
                })
            }
        ],
        [
            () => true,
            (err) => {
                return response.status(statusCode).json({
                    status: 'error',
                    error: message,
                })
            }
        ]
    ])

    const matchedHandler = Array.from(errorHandlers.entries())
        .find(([condition]) => condition(error))

    if (matchedHandler) {
        const [_, handler] = matchedHandler
        handler(error)
    }
}