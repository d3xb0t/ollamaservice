/**
 * Zod schemas for request validation.
 * Defines the schema for validating the prompt object in the request body.
 * @file
 * @module zod
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
 * @type {z.ZodObject}
 */
export const promptSchema = z.object({
  prompt: z
    .string({ required_error: 'El campo "prompt" es obligatorio.' })
    .min(1, { message: 'El prompt no puede estar vacío.' })
    .max(4096, { message: 'El prompt no puede exceder los 4096 caracteres.' })
    .trim()
    .refine((str) => str.length > 0, {
      message: 'El prompt no puede contener solo espacios.',
    }),
})