import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import router from './routes/ollama.route.js'
import { NODE_ENV } from './config/env.js'

/**
 * Express application instance.
 * @type {express.Application}
 */
const app = express()

// Middleware
/**
 * Enable CORS for all origins.
 * @name cors
 * @function
 * @memberof app
 */
app.use(cors({
  origin: "*"
}))

/**
 * HTTP request logger middleware.
 * Uses 'dev' format in development and 'tiny' format in production.
 * @name morgan
 * @function
 * @memberof app
 */
app.use( NODE_ENV  === 'development' ? morgan('dev') : morgan('tiny') )

/**
 * Parse incoming requests with JSON payloads.
 * @name json
 * @function
 * @memberof app
 */
app.use(express.json())

/**
 * Main router for handling API requests.
 * @name router
 * @function
 * @memberof app
 */
app.use('/', router)

/**
 * Global error handling middleware.
 * @name errorMiddleware
 * @function
 * @memberof app
 * @param {Error} err - The error object
 * @param {Object} req - The HTTP request object
 * @param {Object} res - The HTTP response object
 * @param {Function} next - The next middleware function
 */
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: '¡Algo salió mal!' })
})

/**
 * Catch-all middleware for handling 404 errors.
 * @name notFoundMiddleware
 * @function
 * @memberof app
 * @param {Object} req - The HTTP request object
 * @param {Object} res - The HTTP response object
 */
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' })
})

export default app