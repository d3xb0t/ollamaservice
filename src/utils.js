import rateLimit from "express-rate-limit"

export const asyncErrorHandler = (func) => {
    return (requests, response, next) => {
        func(requests, response, next).catch(err => next(err)) 
    }
}

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