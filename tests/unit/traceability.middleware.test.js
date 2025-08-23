// tests/unit/traceability.middleware.test.js
import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest'

let traceabilityMiddleware

// Mock logger and crypto before importing the middleware
vi.mock('../../src/logger.js', () => ({
  default: {
    info: vi.fn()
  }
}))

// Mock crypto module
const mockRandomUUID = vi.fn()
vi.mock('crypto', async () => {
  return {
    default: {
      randomUUID: mockRandomUUID
    }
  }
})

beforeAll(async () => {
  // Import the middleware after mocks are set up
  const middlewareModule = await import('../../src/middleware/traceability.js')
  traceabilityMiddleware = middlewareModule.default
})

describe('Traceability Middleware', () => {
  let mockRequest, mockResponse, mockNext
  let mockLogger

  beforeEach(async () => {
    mockRequest = {
      method: 'POST',
      url: '/test',
      ip: '127.0.0.1',
      get: vi.fn().mockReturnValue('TestAgent'),
      headers: {},
      connection: { remoteAddress: '127.0.0.1' }
    }
    mockResponse = {
      setHeader: vi.fn(),
      statusCode: 200,
      statusMessage: 'OK',
      on: vi.fn() // To mock the 'finish' event listener
    }
    mockNext = vi.fn()
    // Import the mocked logger instance
    mockLogger = (await import('../../src/logger.js')).default
    
    // Reset the mock and other mocks before each test
    mockRandomUUID.mockReset()
    vi.clearAllMocks()
  })

  it('should generate a requestId, attach it to req and res headers, and log the incoming request', async () => {
    const mockUUID = '123e4567-e89b-12d3-a456-426614174000'
    mockRandomUUID.mockReturnValue(mockUUID)

    traceabilityMiddleware(mockRequest, mockResponse, mockNext)

    // Check if UUID was generated and attached
    expect(mockRandomUUID).toHaveBeenCalled()
    expect(mockRequest.requestId).toBe(mockUUID)
    expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Request-ID', mockUUID)

    // Check if incoming request was logged
    expect(mockLogger.info).toHaveBeenCalledWith('Incoming request', {
      requestId: mockUUID,
      method: 'POST',
      url: '/test',
      ip: '127.0.0.1',
      userAgent: 'TestAgent'
    })

    // Check if finish listener was set up
    expect(mockResponse.on).toHaveBeenCalledWith('finish', expect.any(Function))

    // Check if next() was called
    expect(mockNext).toHaveBeenCalled()
  })

  it('should log the request completion when the response finishes', async () => {
    const mockUUID = '123e4567-e89b-12d3-a456-426614174000'
    mockRandomUUID.mockReturnValue(mockUUID)

    traceabilityMiddleware(mockRequest, mockResponse, mockNext)

    // Get the callback passed to res.on('finish', ...)
    const finishCallback = mockResponse.on.mock.calls[0][1]

    // Simulate the 'finish' event
    finishCallback()

    // Check if completion was logged
    expect(mockLogger.info).toHaveBeenCalledWith('Request completed', {
      requestId: mockUUID,
      method: 'POST',
      url: '/test',
      statusCode: 200,
      statusMessage: 'OK'
    })
  })
})