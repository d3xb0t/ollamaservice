/**
 * Ollama chat routes.
 * Defines the routes for handling chat requests.
 * @file
 * @module routes/ollama
 */

import { Router } from 'express'
import chat from '../controller/ollama.controller.js'

/**
 * Express router for handling Ollama chat requests.
 * @type {express.Router}
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
 */
router.post('/', chat)

export default router