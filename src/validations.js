/**
 * Request validation middleware.
 * Validates the user prompt in the request body.
 * This module provides comprehensive input validation to ensure data integrity
 * and prevent malicious inputs from reaching the application core.
 * 
 * Validation Layers:
 * 1. Schema Validation: Structure and type checking with Zod
 * 2. Security Validation: Forbidden pattern checking
 * 3. Business Rule Validation: Application-specific constraints
 * 
 * Design Pattern: Validation Pipeline
 * This middleware implements a validation pipeline where requests pass
 * through multiple validation stages before reaching business logic.
 * 
 * Security Features:
 * - Input sanitization through schema validation
 * - Forbidden pattern detection
 * - Length and format constraints
 * - Injection attack prevention
 * 
 * @file
 * @module validations
 * @author ChatBot Backend Team
 * @since 1.0.0
 * @copyright 2025 ChatBot Project
 * @license MIT
 * @see {@link https://zod.dev/} Zod Schema Validation
 * @see {@link https://expressjs.com/en/guide/writing-middleware.html} Express Middleware
 */

import { promptSchema } from "./zod.js"
import { FORBIDDEN_PATTERNS } from "./config/patterns.js"
import logger from "./logger.js"

/**
 * Middleware function to validate the user prompt in the request body.
 * Checks that the prompt conforms to the schema and doesn't contain forbidden patterns.
 * This is a critical security middleware that prevents malicious inputs
 * and ensures data quality before processing.
 * 
 * Validation Process:
 * 1. Parse and validate request body with Zod schema
 * 2. Check for forbidden patterns in the prompt
 * 3. If validation passes, continue to next middleware
 * 4. If validation fails, send appropriate error response
 * 
 * Error Handling:
 * - Schema validation errors are passed to error handler middleware
 * - Forbidden pattern errors result in immediate 400 response
 * - All validation failures are logged for security monitoring
 * 
 * Performance Considerations:
 * - Regex pattern matching for forbidden patterns
 * - Zod schema validation overhead
 * - Logging impact on request processing
 * 
 * @function validatePrompt
 * @param {Object} req - The HTTP request object
 * @param {Object} req.body - The request body containing the prompt
 * @param {string} req.requestId - The unique request ID for traceability
 * @param {Object} res - The HTTP response object
 * @param {Function} next - The next middleware function
 * @returns {Object|null} JSON response with error if validation fails, otherwise calls next()
 * @memberof module:validations
 * @since 1.0.0
 * 
 * @example
 * // Use as Express middleware
 * app.use(validatePrompt);
 */
export const validatePrompt = (req, res, next) => {
  try {
    // Parse and validate the request body using Zod schema
    // This ensures the request body has the correct structure and data types
    // Throws ZodError if validation fails
    const parsed = promptSchema.parse(req.body)
    const { prompt } = parsed

    // Check the prompt against forbidden patterns for security
    // This prevents jailbreak attempts and other malicious inputs
    // Each pattern is checked sequentially until a match is found or all are checked
    for (const pattern of FORBIDDEN_PATTERNS) {
      // Test if the current pattern matches the prompt
      // Uses RegExp.test() for efficient pattern matching
      if (pattern.test(prompt)) {
        // Log forbidden pattern detection for security monitoring
        // Includes pattern, truncated prompt, and request ID for traceability
        // This helps identify and analyze attempted security breaches
        logger.warn('Prompt contains forbidden pattern', { 
          pattern: pattern.toString(), 
          prompt: prompt.substring(0, 50) + (prompt.length > 50 ? '...' : ''),
          requestId: req.requestId
        })
        
        // Immediately return error response for forbidden patterns
        // This prevents further processing of malicious inputs
        // Status 400 indicates client error with explanation
        return res.status(400).json({
          error: 'Contenido no permitido',
          message: 'El prompt contiene patrones bloqueados por seguridad (jailbreak, etc.).',
        })
      }
    }

    // Attach validated prompt to request object for use in subsequent middleware
    // This avoids re-parsing the request body in downstream handlers
    // Ensures consistency of validated data throughout request processing
    req.validatedPrompt = prompt
    // Continue to next middleware in the chain
    // This indicates successful validation and allows normal request processing
    next();
  } catch (err) {
    // Log validation failures for debugging and monitoring
    // Includes error message, request body (for debugging), and request ID
    // Helps identify validation issues and potential abuse attempts
    logger.warn('Prompt validation failed', {
      error: err.message,
      body: req.body,
      requestId: req.requestId
    })
    // Pass validation errors to the centralized error handler
    // This ensures consistent error responses and proper error logging
    // ZodError will be handled specially by the error handler
    next(err)
  }
}