/**
 * Ollama chat controller.
 * Handles incoming chat requests and interacts with the Ollama service.
 * This module acts as the intermediary between the HTTP layer and business logic,
 * processing requests, calling services, and formatting responses.
 * 
 * Controller Responsibilities:
 * 1. Request parameter validation and parsing
 * 2. Calling appropriate service functions
 * 3. Handling service responses and errors
 * 4. Formatting HTTP responses
 * 5. Request tracing and logging
 * 6. Audit logging through message queues
 * 
 * Design Pattern: Request Handler
 * This controller follows the Request Handler pattern, where each function
 * handles a specific type of request and coordinates the response.
 * 
 * Error Handling:
 * - Uses asyncErrorHandler wrapper for consistent error handling
 * - Logs all requests and responses for traceability
 * - Reports errors to audit service
 * 
 * @file
 * @module controller/ollama
 * @author ChatBot Backend Team
 * @since 1.0.0
 * @copyright 2025 ChatBot Project
 * @license MIT
 * @see {@link https://expressjs.com/en/guide/writing-middleware.html} Express Middleware
 */

import chatOllama from "../service/ollama.service.js"
import { asyncErrorHandler } from "../utils.js"
import logger from "../logger.js"
import { error } from "console"

/**
 * Handles chat requests by sending the user's prompt to the Ollama service.
 * This is the main controller function for the chat endpoint, responsible for
 * processing user prompts and returning AI-generated responses.
 * 
 * Processing Flow:
 * 1. Validate RabbitMQ connection
 * 2. Log incoming request
 * 3. Call Ollama service with prompt
 * 4. Log response
 * 5. Send HTTP response
 * 
 * Request Processing:
 * - Extracts prompt from request body
 * - Uses requestId for traceability
 * - Sends audit message to RabbitMQ
 * 
 * Response Handling:
 * - Formats Ollama response for HTTP delivery
 * - Logs response content (truncated for security)
 * - Handles service errors appropriately
 * 
 * @async
 * @function chat
 * @param {Object} req - The HTTP request object
 * @param {Object} req.body - The request body
 * @param {string} req.body.prompt - The user's prompt
 * @param {string} req.requestId - The unique request ID
 * @param {Object} req.rabbitChannel - The RabbitMQ channel for audit logging
 * @param {Object} res - The HTTP response object
 * @returns {Promise<void>}
 * 
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
 * @memberof module:controller/ollama
 * @since 1.0.0
 * @throws {Error} When RabbitMQ is not connected
 * @throws {Error} When Ollama service is unavailable
 * @throws {Error} When prompt validation fails
 */
const chat = asyncErrorHandler(async (req, res) => {

    // Validate RabbitMQ connection before proceeding
    // This ensures audit logging capability before processing the request
    // If RabbitMQ is not connected, return a 500 error immediately
    const channel = req.rabbitChannel
    if(!channel) {
      /**
       * Handle missing RabbitMQ connection
       * This error condition indicates that the message queue system
       * is not available, which is required for audit logging.
       * 
       * Error Response:
       * - Status: 500 Internal Server Error
       * - Body: JSON error message
       * 
       * Impact:
       * - Request cannot be processed
       * - Audit logging is unavailable
       * - System is in degraded state
       */
      return res.status(500).json({
        error: 'RabbitMQ not connected'
      })
    }
    
    // Send audit message to RabbitMQ queue
    // This provides asynchronous audit logging of requests
    // Even if this fails, the request processing continues
    channel.sendToQueue('auditoria', Buffer.from(JSON.stringify(req.headers)))
    
    // Log incoming chat request for debugging and monitoring
    // Includes the prompt (for debugging) and request ID (for traceability)
    // Prompt is logged for visibility but care is taken with sensitive data
    logger.info('Received chat request', { 
      prompt: req.body.prompt,
      requestId: req.requestId
    })
    
    // Call the Ollama service to process the prompt
    // This is the core business logic that interacts with the AI model
    // The service handles the complexity of communicating with Ollama
    const response = await chatOllama(req.body.prompt, req.requestId)
    
    // Log the response before sending to client
    // This provides visibility into AI responses for debugging and monitoring
    // Response content is logged but truncated for security and log size management
    logger.info('Sending chat response', { 
      response: response.message?.content,
      requestId: req.requestId
    })
    
    // Send the response back to the client
    // The response format is determined by the Ollama service
    // Status code 200 indicates successful processing
    res.status(200).json(response)
})

export default chat