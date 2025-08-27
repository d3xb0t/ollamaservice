/**
 * Ollama chat controller.
 * Handles incoming chat requests and interacts with the Ollama service.
 * @file
 * @module controller/ollama
 */

import chatOllama from "../service/ollama.service.js"
import { asyncErrorHandler } from "../utils.js"
import logger from "../logger.js"

/**
 * Handles chat requests by sending the user's prompt to the Ollama service.
 * @async
 * @param {Object} req - The HTTP request object
 * @param {Object} req.body - The request body
 * @param {string} req.body.prompt - The user's prompt
 * @param {string} req.requestId - The unique request ID
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
 */
const chat = asyncErrorHandler(async (req, res) => {

    const channel = req.rabbitChannel
    console.log(channel)

    logger.info('Received chat request', { 
      prompt: req.body.prompt,
      requestId: req.requestId
    })
    
    const response = await chatOllama(req.body.prompt, req.requestId)
    
    logger.info('Sending chat response', { 
      response: response.message?.content,
      requestId: req.requestId
    })
    res.status(200).json(response)
})

export default chat