import z from 'zod'

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