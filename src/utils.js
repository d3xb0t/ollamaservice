import rateLimit from "express-rate-limit"

/**
 * Higher-order function that wraps an async route handler to catch any errors
 * and pass them to the next middleware.
 * @param {Function} func - The async route handler function
 * @returns {Function} A wrapper function that handles errors
 */
export const asyncErrorHandler = (func) => {
    return (requests, response, next) => {
        func(requests, response, next).catch(err => next(err)) 
    }
}

/**
 * Rate limiting middleware to control how many requests a user can make
 * within a specified time window.
 * @type {Object}
 */
export const rateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 20,
  message: {
    error: 'Límite de solicitudes excedido',
    message: 'Has realizado demasiadas solicitudes. Por favor, espera un momento.',
  },
  standardHeaders: true, // Devuelve headers: RateLimit-*
  legacyHeaders: false, // No usar `X-RateLimit-*`
})