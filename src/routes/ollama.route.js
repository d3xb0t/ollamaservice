/**
 * Ollama chat routes.
 * Defines the routes for handling chat requests.
 * This module is responsible for mapping HTTP endpoints to controller functions
 * and defining the API contract through OpenAPI (Swagger) documentation.
 * 
 * Route Design Pattern: Resource-oriented RESTful API
 * Routes follow REST principles with clear resource identification and
 * appropriate HTTP verbs for operations.
 * 
 * API Endpoints:
 * - POST / : Send a prompt to the AI chatbot
 * 
 * Middleware Chain:
 * 1. Rate limiting (applied at application level)
 * 2. Prompt validation (applied at application level)
 * 3. Controller function
 * 
 * @file
 * @module routes/ollama
 * @author ChatBot Backend Team
 * @since 1.0.0
 * @copyright 2025 ChatBot Project
 * @license MIT
 * @see {@link https://expressjs.com/en/guide/routing.html} Express Routing
 * @see {@link https://swagger.io/specification/} OpenAPI Specification
 */

import { Router } from 'express'
import chat from '../controller/ollama.controller.js'

/**
 * Express router for handling Ollama chat requests.
 * This router instance is used to define all routes related to the chat functionality.
 * It provides methods for defining routes with different HTTP verbs and middleware.
 * 
 * Router Capabilities:
 * - Route definition for all HTTP methods (GET, POST, PUT, DELETE, etc.)
 * - Middleware chaining
 * - Route parameter handling
 * - Nested routers
 * 
 * Design Pattern: Router Factory
 * This pattern creates a dedicated router instance for a specific domain or feature.
 * 
 * @type {express.Router}
 * @constant {express.Router}
 * @memberof module:routes/ollama
 * @since 1.0.0
 * @see {@link https://expressjs.com/en/4x/api.html#router} Express Router
 */
const router = Router()

/**
 * @swagger
 * /:
 *   post:
 *     summary: Send a prompt to the AI chatbot
 *     description: Send a text prompt to the Ollama-powered AI chatbot and receive a response
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Prompt'
 *     responses:
 *       200:
 *         description: Successful response from the AI chatbot
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatResponse'
 *       400:
 *         description: Invalid request due to bad input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       503:
 *         description: Service unavailable, typically when Ollama is not running
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 * API Contract:
 * This endpoint defines a contract between the client and server for chat functionality.
 * 
 * Request Requirements:
 * - Method: POST
 * - Content-Type: application/json
 * - Body: JSON object with 'prompt' field
 * 
 * Response Guarantees:
 * - 200: Valid response with AI-generated content
 * - 400: Client error with validation details
 * - 503: Server error when dependent services are unavailable
 * 
 * Security Considerations:
 * - Input validation prevents injection attacks
 * - Rate limiting prevents abuse
 * - Forbidden pattern checking prevents jailbreak attempts
 * 
 * Performance Characteristics:
 * - Response time depends on AI model processing
 * - Asynchronous processing with request tracking
 * - Non-blocking I/O operations
 * 
 * Monitoring:
 * - Request tracing with unique IDs
 * - Performance metrics collection
 * - Error rate tracking
 * 
 * @name post_chat
 * @route {POST} /
 * @memberof module:routes/ollama
 * @since 1.0.0
 */
router.post('/', chat)

export default router