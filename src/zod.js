/**
 * Zod schemas for request validation.
 * Defines the schema for validating the prompt object in the request body.
 * This module provides type-safe schema validation for incoming requests,
 * ensuring data integrity and preventing invalid data from reaching the application core.
 * 
 * Schema Design Principles:
 * 1. Explicit validation rules for all fields
 * 2. Clear error messages for validation failures
 * 3. Data sanitization through transformation
 * 4. Type safety through static schema definition
 * 
 * Design Pattern: Schema Validation
 * This module implements the Schema Validation pattern using Zod,
 * providing a declarative approach to data validation with strong typing.
 * 
 * Validation Features:
 * - Type checking (string)
 * - Required field validation
 * - Length constraints (min/max)
 * - Data transformation (trim)
 * - Custom validation rules (non-empty after trim)
 * 
 * @file
 * @module zod
 * @author ChatBot Backend Team
 * @since 1.0.0
 * @copyright 2025 ChatBot Project
 * @license MIT
 * @see {@link https://zod.dev/} Zod Schema Validation
 */

import z from 'zod'

/**
 * Zod schema for validating the prompt object in the request body.
 * Ensures that the prompt is a string with specific constraints:
 * - Required field
 * - Minimum 1 character
 * - Maximum 4096 characters
 * - Trims whitespace
 * - Cannot contain only whitespace
 * 
 * Schema Constraints:
 * - Type: String
 * - Required: Yes
 * - Min Length: 1 character
 * - Max Length: 4096 characters
 * - Transformation: Trim leading/trailing whitespace
 * - Custom Rule: Non-empty after trimming
 * 
 * Error Messages:
 * - Required: "El campo "prompt" es obligatorio."
 * - Min Length: "El prompt no puede estar vacío."
 * - Max Length: "El prompt no puede exceder los 4096 caracteres."
 * - Custom Rule: "El prompt no puede contener solo espacios."
 * 
 * Design Pattern: Declarative Validation Schema
 * This schema uses a declarative approach to define validation rules,
 * making them easy to read, maintain, and test.
 * 
 * @type {z.ZodObject}
 * @constant {z.ZodObject}
 * @memberof module:zod
 * @since 1.0.0
 * 
 * @example
 * // Validate a prompt
 * try {
 *   const validatedData = promptSchema.parse({ prompt: "Hello, world!" });
 *   console.log(validatedData.prompt); // "Hello, world!"
 * } catch (err) {
 *   // Handle validation error
 *   console.error(err);
 * }
 * 
 * @example
 * // Validation failure
 * try {
 *   promptSchema.parse({ prompt: "" });
 * } catch (err) {
 *   // ZodError with detailed validation issues
 *   console.error(err.issues);
 * }
 */
export const promptSchema = z.object({
  /**
   * The user's prompt string.
   * This is the main input field that users provide to the chatbot.
   * 
   * Validation Pipeline:
   * 1. Type Check: Must be a string
   * 2. Required Check: Cannot be undefined or null
   * 3. Min Length: At least 1 character
   * 4. Max Length: No more than 4096 characters
   * 5. Transformation: Trim whitespace from both ends
   * 6. Custom Validation: Cannot be empty after trimming
   * 
   * Constraints:
   * - Type: string
   * - Required: true
   * - Min Length: 1
   * - Max Length: 4096
   * - Transformation: trim()
   * - Custom Validation: refine() for non-empty check
   */
  prompt: z
    .string({ required_error: 'El campo "prompt" es obligatorio.' })
    .min(1, { message: 'El prompt no puede estar vacío.' })
    .max(4096, { message: 'El prompt no puede exceder los 4096 caracteres.' })
    .trim()
    .refine((str) => str.length > 0, {
      message: 'El prompt no puede contener solo espacios.',
    }),
})