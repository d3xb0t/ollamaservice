/**
 * Main application file.
 * Sets up the Express application, middleware, routes, and error handling.
 * @file
 * @module app
 */

import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'
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
 * The Express application instance.
 * @type {express.Application}
 */
const app = express()

/**
 * The generated Swagger specification.
 * @type {object}
 */
const swaggerSpec = swaggerJsdoc(swaggerOptions)

// Use helmet middleware to enhance application security
// Protects the app from some well-known web vulnerabilities by setting various HTTP headers
app.use(helmet())

// Swagger UI route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Traceability middleware
app.use(traceabilityMiddleware)

// Database connection middleware
app.use(databaseConnectionMiddleware)

// Request logging middleware
app.use(requestLogger)

// CORS middleware
app.use(cors({
  origin: "http://localhost:5173"
}))

// Morgan logger (commented out)
//app.use( NODE_ENV  === 'development' ? morgan('dev') : morgan('tiny') )

// Parse JSON bodies
app.use(express.json())

// Main route with rate limiting and validation
app.use('/', rateLimiter, validatePrompt, router)

// Error handling middleware
app.use(errorHandler)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' })
})

export default app