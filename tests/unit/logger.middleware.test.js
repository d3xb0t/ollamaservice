// tests/unit/logger.middleware.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock logger
vi.mock('../../src/logger.js', () => ({
  default: {
    info: vi.fn()
  }
}))

// Dynamically import the middleware after mocks are set up
let requestLogger
beforeAll(async () => {
  const middlewareModule = await import('../../src/middleware/logger.js')
  requestLogger = middlewareModule.default
})

describe('Request Logger Middleware', () => {
  let mockRequest, mockResponse, mockNext
  let mockLogger

  beforeEach(async () => {
    mockRequest = {
      method: 'POST',
      url: '/test',
      headers: {
        'user-agent': 'TestAgent'
      },
      ip: '127.0.0.1',
      requestId: 'test-request-id',
      connection: { remoteAddress: '127.0.0.1' }
    }
    mockResponse = {
      statusCode: 200,
      on: vi.fn() // To mock the 'finish' event listener
    }
    mockNext = vi.fn()
    // Import the mocked logger instance
    mockLogger = (await import('../../src/logger.js')).default
    vi.clearAllMocks()
  })

  it('should call next() immediately and set up a listener for the finish event', () => {
    requestLogger(mockRequest, mockResponse, mockNext)

    expect(mockNext).toHaveBeenCalled()
    expect(mockResponse.on).toHaveBeenCalledWith('finish', expect.any(Function))
  })

  it('should log request details when the response finishes', () => {
    // Mock Date.now to control the duration calculation
    const startTime = 1000000
    const endTime = 1000500 // 500ms later
    const dateNowSpy = vi.spyOn(global.Date, 'now')
      .mockReturnValueOnce(startTime) // First call (start time)
      .mockReturnValueOnce(endTime)   // Second call (end time)

    requestLogger(mockRequest, mockResponse, mockNext)

    // Get the callback passed to res.on('finish', ...)
    const finishCallback = mockResponse.on.mock.calls[0][1]

    // Simulate the 'finish' event
    finishCallback()

    // Check if the request was logged with correct details
    expect(mockLogger.info).toHaveBeenCalledWith(
      'POST /test 200 - 500ms',
      {
        method: 'POST',
        url: '/test',
        statusCode: 200,
        duration: '500ms',
        userAgent: 'TestAgent',
        ip: '127.0.0.1',
        requestId: 'test-request-id'
      }
    )

    // Restore Date.now
    dateNowSpy.mockRestore()
  })
})