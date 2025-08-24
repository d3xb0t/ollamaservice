import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import router from './routes/ollama.route.js'
import { NODE_ENV } from './config/env.js'
import { errorHandler } from './errors.js'
import { validatePrompt } from './validations.js'
import { rateLimiter } from './utils.js'
import swaggerUi from 'swagger-ui-express'
import swaggerOptions from './config/swagger.js'
import swaggerJsdoc from 'swagger-jsdoc'
import requestLogger from './middleware/logger.js'
import traceabilityMiddleware from './middleware/traceability.js'
import { databaseConnectionMiddleware } from './dbDriver/mongoDriver.js'

/**
 * Express application instance.
 * @type {express.Application}
 */
const app = express()

// Swagger setup
/**
 * Swagger specification generated from JSDoc comments.
 * @type {Object}
 */
const swaggerSpec = swaggerJsdoc(swaggerOptions)

/**
 * Serve Swagger UI documentation at /api-docs route.
 * @name swaggerUi
 * @function
 * @memberof app
 */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Middleware
/** 
 * Traceability middleware for request ID generation and tracking.
 * @name traceabilityMiddleware
 * @function
 * @memberof app
 */
app.use(traceabilityMiddleware)

/** 
 * Database connection middleware.
 * Ensures database connectivity before processing requests.
 * @name databaseConnectionMiddleware
 * @function
 * @memberof app
 */
app.use(databaseConnectionMiddleware)

/** 
 * Request logger middleware.
 * @name requestLogger
 * @function
 * @memberof app
 */
app.use(requestLogger)

/**
 * Enable CORS for all origins.
 * This middleware adds CORS headers to allow requests from any origin.
 * @name cors
 * @function
 * @memberof app
 * @see {@link https://www.npmjs.com/package/cors|cors package}
 */
app.use(cors({
  origin: "http://localhost:5173"
}))

/**
 * HTTP request logger middleware.
 * Uses 'dev' format in development and 'tiny' format in production.
 * @name morgan
 * @function
 * @memberof app
 * @param {string} NODE_ENV - The current Node.js environment
 * @see {@link https://www.npmjs.com/package/morgan|morgan package}
 */
//app.use( NODE_ENV  === 'development' ? morgan('dev') : morgan('tiny') )

/**
 * Parse incoming requests with JSON payloads.
 * This middleware parses incoming requests with JSON payloads into req.body.
 * @name json
 * @function
 * @memberof app
 * @see {@link https://expressjs.com/en/api.html#express.json|Express JSON parser}
 */
app.use(express.json())

/**
 * Main router for handling API requests.
 * Mounts the Ollama router at the root path.
 * @name router
 * @function
 * @memberof app
 * @param {string} path - The root path for the router
 * @param {express.Router} router - The Ollama router instance
 */
app.use('/', rateLimiter, validatePrompt, router)

/**
 * Global error handling middleware.
 * Handles all errors that occur in the application and sends appropriate responses.
 * @name errorMiddleware
 * @function
 * @memberof app
 * @param {Function} errorHandler - The error handling middleware function
 * @see {@link module:errors.errorHandler}
 */
app.use(errorHandler)

/**
 * Catch-all middleware for handling 404 errors.
 * Handles all requests that don't match any defined routes.
 * @name notFoundMiddleware
 * @function
 * @memberof app
 * @param {Object} req - The HTTP request object
 * @param {Object} res - The HTTP response object
 * @returns {Object} JSON response with 404 status and error message
 */
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' })
})

export default app