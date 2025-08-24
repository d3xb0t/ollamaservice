/**
 * Request validation middleware.
 * Validates the user prompt in the request body.
 * @file
 * @module validations
 */

import { promptSchema } from "./zod.js"
import { FORBIDDEN_PATTERNS } from "./config/patterns.js"
import logger from "./logger.js"

/**
 * Middleware function to validate the user prompt in the request body.
 * Checks that the prompt conforms to the schema and doesn't contain forbidden patterns.
 * @param {Object} req - The HTTP request object
 * @param {Object} res - The HTTP response object
 * @param {Function} next - The next middleware function
 * @returns {Object|null} JSON response with error if validation fails, otherwise calls next()
 */
export const validatePrompt = (req, res, next) => {
  try {
    const parsed = promptSchema.parse(req.body)
    const { prompt } = parsed

    for (const pattern of FORBIDDEN_PATTERNS) {
      if (pattern.test(prompt)) {
        logger.warn('Prompt contains forbidden pattern', { 
          pattern: pattern.toString(), 
          prompt: prompt.substring(0, 50) + (prompt.length > 50 ? '...' : ''),
          requestId: req.requestId
        })
        
        return res.status(400).json({
          error: 'Contenido no permitido',
          message: 'El prompt contiene patrones bloqueados por seguridad (jailbreak, etc.).',
        })
      }
    }

    req.validatedPrompt = prompt
    next();
  } catch (err) {
    logger.warn('Prompt validation failed', {
      error: err.message,
      body: req.body,
      requestId: req.requestId
    })
    next(err)
  }
}