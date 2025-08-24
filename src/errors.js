import logger from './logger.js'

export class CustomError extends Error{
    constructor(message, statusCode){
        super(message)
        this.statusCode = statusCode
        this.status = statusCode >= 404 && statusCode < 500 ? 'fail':'error'

        this.isOperational = true
        Error.captureStackTrace(this, this.constructor)
    }
}

export const errorHandler = (error, request, response, next) => {
    const {
        statusCode = 500,
        message = 'An unexpected error occurred',
    } = error
    
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