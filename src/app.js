/**
 * Main application file.
 * Sets up the Express application, middleware, routes, and error handling.
 * This file serves as the central configuration point for the entire backend application,
 * orchestrating all components to create a cohesive web service.
 * 
 * Architecture:
 * - Security middleware (helmet)
 * - API documentation (Swagger)
 * - Traceability and logging middleware
 * - Database connectivity middleware
 * - Request parsing middleware
 * - CORS configuration
 * - Rate limiting and validation
 * - Route definitions
 * - Error handling middleware
 * - 404 fallback handler
 * 
 * @file
 * @module app
 * @author ChatBot Backend Team
 * @since 1.0.0
 * @copyright 2025 ChatBot Project
 * @license MIT
 * @see {@link https://expressjs.com/} Express.js Framework
 * @see {@link https://www.npmjs.com/package/helmet} Helmet Security Middleware
 * @see {@link https://swagger.io/specification/} OpenAPI Specification
 */

import express from 'express'
import cors from 'cors'
import { initRabbitMQ } from './middleware/rabbitMQ.js'
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
 * This is the core Express application object that all middleware and routes are attached to.
 * It provides the HTTP server functionality and request/response handling capabilities.
 * 
 * Design Pattern: Application Registry
 * This instance acts as the central registry for all application components.
 * 
 * @type {express.Application}
 * @constant {express.Application}
 * @memberof module:app
 * @since 1.0.0
 */
const app = express()

/**
 * The generated Swagger specification.
 * This object contains the complete OpenAPI specification generated from JSDoc comments
 * and configuration files. It provides the foundation for the interactive API documentation.
 * 
 * The specification includes:
 * - API information (title, version, description)
 * - Server definitions
 * - Path definitions with parameters and responses
 * - Component schemas
 * - Security definitions
 * 
 * @type {object}
 * @constant {object}
 * @memberof module:app
 * @since 1.0.0
 * @see {@link https://swagger.io/specification/} OpenAPI Specification
 */
const swaggerSpec = swaggerJsdoc(swaggerOptions)

// Use helmet middleware to enhance application security
// Protects the app from some well-known web vulnerabilities by setting various HTTP headers
// Security Enhancement: Applies multiple security headers to prevent common attacks:
// - X-Content-Type-Options: Prevents MIME-type sniffing
// - X-DNS-Prefetch-Control: Controls browser DNS prefetching
// - X-Download-Options: Prevents IE from executing downloads
// - X-Frame-Options: Prevents clickjacking
// - X-Permitted-Cross-Domain-Policies: Restricts cross-domain policies
// - X-XSS-Protection: Enables XSS filtering
// - Content-Security-Policy: Prevents XSS and code injection attacks
// - Expect-CT: Enforces Certificate Transparency
// - Referrer-Policy: Controls referrer information
// - Strict-Transport-Security: Enforces HTTPS
app.use(helmet())

// Swagger UI route
// Provides interactive API documentation at /api-docs
// This middleware serves the Swagger UI static files and sets up the documentation interface
// Users can test API endpoints directly from the browser
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Traceability middleware
// Generates and attaches a unique request ID to each incoming request
// This enables end-to-end traceability across all system components
// Also logs incoming requests with detailed information
app.use(traceabilityMiddleware)

// Database connection middleware
// Ensures database connectivity before processing requests
// Implements automatic retry logic for failed connections
// Prevents requests from being processed when database is unavailable
app.use(databaseConnectionMiddleware)

// Request logging middleware
// Logs incoming requests and their responses with detailed information
// Records metrics such as response time, status codes, and request characteristics
app.use(requestLogger)

// CORS middleware
// Configures Cross-Origin Resource Sharing policies
// Currently allows requests from localhost:5173 (frontend development server)
// In production, this should be restricted to specific domains
app.use(cors({
  origin: "http://localhost:5173"
}))

// Morgan logger (commented out)
// Alternative logging middleware that was previously used
// Provides HTTP request logging in development and production formats
// Currently disabled in favor of custom requestLogger middleware
//app.use( NODE_ENV  === 'development' ? morgan('dev') : morgan('tiny') )

// Parse JSON bodies
// Middleware that parses incoming request bodies with JSON payloads
// Populates req.body with the parsed data
// Implements security limits to prevent overly large payloads
app.use(express.json())

// Initialize RabbitMQ connection
// Establishes connection to RabbitMQ message broker
// Provides message queuing capabilities for asynchronous processing
// Required for audit logging and other background tasks
app.use(initRabbitMQ)

// Main route with rate limiting and validation
// Registers the primary application routes with protective middleware
// Applies rate limiting to prevent API abuse
// Validates incoming prompts before processing
app.use('/', rateLimiter, validatePrompt, router)

// Error handling middleware
// Centralized error handling for the entire application
// Catches unhandled errors and provides consistent error responses
// Also handles audit logging of errors
app.use(errorHandler)

// 404 handler
// Catches all requests that don't match any defined routes
// Returns a consistent JSON error response for unmatched endpoints
// Prevents default Express 404 HTML response
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' })
})

export default app