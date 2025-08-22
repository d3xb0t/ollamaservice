import { promptSchema } from "./zod.js"
import { FORBIDDEN_PATTERNS } from "./config/patterns.js"

export const validatePrompt = (req, res, next) => {
  try {
    const parsed = promptSchema.parse(req.body)
    const { prompt } = parsed

    for (const pattern of FORBIDDEN_PATTERNS) {
      if (pattern.test(prompt)) {
        return res.status(400).json({
          error: 'Contenido no permitido',
          message: 'El prompt contiene patrones bloqueados por seguridad (jailbreak, etc.).',
        })
      }
    }

    req.validatedPrompt = prompt
    next();
  } catch (err) {
    next(err)
  }
}

