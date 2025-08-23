// tests/unit/validations.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { validatePrompt } from '../../src/validations.js'
import { promptSchema } from '../../src/zod.js'
import { FORBIDDEN_PATTERNS } from '../../src/config/patterns.js'

// Mock logger
vi.mock('../../src/logger.js', () => ({
  default: {
    warn: vi.fn()
  }
}))

describe('Validations', () => {
  let req, res, next
  let mockLogger

  beforeEach(async () => {
    // Import the mocked logger instance
    mockLogger = (await import('../../src/logger.js')).default

    req = {
      body: {},
      requestId: 'test-request-id'
    }
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    }
    next = vi.fn()
    // Clear all mocks before each test
    vi.clearAllMocks()
  })

  describe('validatePrompt', () => {
    it('should call next() for a valid prompt', () => {
      req.body = { prompt: 'Hello, this is a valid prompt.' }

      validatePrompt(req, res, next)

      expect(next).toHaveBeenCalled()
      expect(req.validatedPrompt).toBe(req.body.prompt)
      expect(res.status).not.toHaveBeenCalled()
      expect(res.json).not.toHaveBeenCalled()
    })

    it('should call next(err) for an empty prompt (Zod validation)', () => {
      req.body = { prompt: '' }

      validatePrompt(req, res, next)

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'ZodError' }))
      expect(res.status).not.toHaveBeenCalled()
      expect(res.json).not.toHaveBeenCalled()
    })

    it('should call next(err) for a prompt that is too long (Zod validation)', () => {
      req.body = { prompt: 'A'.repeat(5000) } // Exceeds max length

      validatePrompt(req, res, next)

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'ZodError' }))
      expect(res.status).not.toHaveBeenCalled()
      expect(res.json).not.toHaveBeenCalled()
    })

    it('should return 400 for a prompt containing a forbidden pattern', async () => {
      const forbiddenPrompt = `This is a test with a ${FORBIDDEN_PATTERNS[0].source} pattern.`
      req.body = { prompt: forbiddenPrompt }

      validatePrompt(req, res, next)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Contenido no permitido',
        message: 'El prompt contiene patrones bloqueados por seguridad (jailbreak, etc.).'
      })
      expect(next).not.toHaveBeenCalled()
      expect(mockLogger.warn).toHaveBeenCalled()
    })

    it('should handle multiple forbidden patterns and catch the first one', async () => {
      // Create a prompt with two forbidden patterns
      const pattern1 = FORBIDDEN_PATTERNS[0].source
      const pattern2 = FORBIDDEN_PATTERNS[1].source
      req.body = { prompt: `Test ${pattern1} and ${pattern2}` }

      validatePrompt(req, res, next)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Contenido no permitido',
        message: 'El prompt contiene patrones bloqueados por seguridad (jailbreak, etc.).'
      })
      expect(next).not.toHaveBeenCalled()
      expect(mockLogger.warn).toHaveBeenCalled()
    })

    it('should call next() for a prompt without any forbidden pattern', async () => {
      req.body = { prompt: 'This is a clean prompt with no bad words or patterns.' }

      validatePrompt(req, res, next)

      expect(next).toHaveBeenCalled()
      expect(req.validatedPrompt).toBe(req.body.prompt)
      expect(res.status).not.toHaveBeenCalled()
      expect(res.json).not.toHaveBeenCalled()
      expect(mockLogger.warn).not.toHaveBeenCalled()
    })
  })
})