import { Router } from 'express'
import chat from '../controller/ollama.controller.js'

/**
 * Express router for handling Ollama chat requests.
 * @type {express.Router}
 */
const router = Router()

/**
 * Route for handling chat requests.
 * @name post/
 * @function
 * @memberof module:routes/ollama.route
 * @param {string} path - The route path
 * @param {Function} controller - The controller function to handle the request
 */
router.post('/', chat)

export default router