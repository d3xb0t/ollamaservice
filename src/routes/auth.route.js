/**
 * Authentication routes.
 * Defines the routes for user registration and authentication.
 * This module is responsible for mapping HTTP endpoints to authentication controller functions.
 * 
 * @file
 * @module routes/auth
 * @author ChatBot Backend Team
 * @since 1.0.0
 * @copyright 2025 ChatBot Project
 * @license MIT
 * @see {@link https://expressjs.com/en/guide/routing.html} Express Routing
 */

import { Router } from 'express'
import { register } from '../controller/auth.controller.js'

/**
 * Express router for handling authentication requests.
 * 
 * @type {express.Router}
 * @constant {express.Router}
 * @memberof module:routes/auth
 * @since 1.0.0
 */
const router = Router()

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account with username, password, and optional email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Desired username (must be unique)
 *               password:
 *                 type: string
 *                 description: Desired password (minimum 6 characters)
 *               email:
 *                 type: string
 *                 description: User's email address (optional, must be unique if provided)
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid request due to bad input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Username or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 * @name post_register
 * @route {POST} /auth/register
 * @memberof module:routes/auth
 * @since 1.0.0
 */
router.post('/register', register)

export default router