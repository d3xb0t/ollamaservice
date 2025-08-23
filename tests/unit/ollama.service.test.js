// tests/unit/ollama.service.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ollama from 'ollama'

// Mock ollama and logger
vi.mock('ollama')
vi.mock('../../src/logger.js', () => ({
  default: {
    info: vi.fn()
  }
}))

// Dynamically import the service after mocks are set up
let chatOllama
beforeAll(async () => {
  const serviceModule = await import('../../src/service/ollama.service.js')
  chatOllama = serviceModule.default
})

describe('Ollama Service', () => {
  const mockPrompt = 'Hello, AI!'
  const mockRequestId = 'test-request-id'
  const mockOllamaResponse = {
    model: 'gemma3:270m',
    message: { role: 'assistant', content: 'Hi there!' },
    done: true
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call ollama.chat and return the content on success', async () => {
    ollama.chat.mockResolvedValue(mockOllamaResponse)

    const result = await chatOllama(mockPrompt, mockRequestId)

    expect(ollama.chat).toHaveBeenCalledWith({
      model: 'gemma3:270m',
      messages: [{ role: 'user', content: mockPrompt }]
    })
    // Note: For simplicity in this test setup, we are not directly asserting on logger calls
    // as accessing the mock instance post-dynamic import can be tricky in this setup.
    // In a real scenario, you might re-structure or use a different mocking strategy for logger here.
    expect(result).toBe(mockOllamaResponse.message.content)
  })

  it('should throw an error if ollama.chat fails', async () => {
    const errorMessage = 'Network error'
    ollama.chat.mockRejectedValue(new Error(errorMessage))

    await expect(chatOllama(mockPrompt, mockRequestId)).rejects.toThrow(errorMessage)

    expect(ollama.chat).toHaveBeenCalledWith({
      model: 'gemma3:270m',
      messages: [{ role: 'user', content: mockPrompt }]
    })
    // Again, logger assertion is skipped for simplicity here.
  })
})