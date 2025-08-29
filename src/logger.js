/**
 * Logger configuration.
 * Sets up the Winston logger with custom formats and transports.
 * This module provides a centralized logging system with configurable
 * transports, formatting, and level-based filtering.
 * 
 * Logging Architecture:
 * 1. Logger Instance: Winston logger with custom configuration
 * 2. Log Formats: Custom formatting with timestamps and request IDs
 * 3. Transports: Multiple output destinations (console, files)
 * 4. Log Rotation: Daily file rotation with size and time limits
 * 5. Environment Configuration: Different settings for dev/prod
 * 
 * Design Pattern: Centralized Logging
 * This module implements the Centralized Logging pattern,
 * providing a single point of configuration for all application logging.
 * 
 * Log Levels:
 * - error: Serious errors requiring immediate attention
 * - warn: Warning conditions that may indicate problems
 * - info: General information about application operation
 * - debug: Detailed information for debugging (dev only)
 * - verbose: Very detailed debugging information (dev only)
 * 
 * Log Transports:
 * 1. Console: Development environment output
 * 2. Error File: Daily rotation of error-level logs
 * 3. Combined File: Daily rotation of all log levels
 * 
 * Log Format Features:
 * - Timestamps in standardized format
 * - Log levels for severity classification
 * - Request ID correlation
 * - Stack trace capture for errors
 * - Structured metadata support
 * 
 * @file
 * @module logger
 * @author ChatBot Backend Team
 * @since 1.0.0
 * @copyright 2025 ChatBot Project
 * @license MIT
 * @see {@link https://github.com/winstonjs/winston} Winston Logger
 * @see {@link https://github.com/winstonjs/winston-daily-rotate-file} Daily Rotate File Transport
 */

import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

/**
 * A WeakMap to store request context (not fully implemented in this snippet).
 * This would be used to maintain context information across asynchronous operations
 * within a single request lifecycle.
 * 
 * Context Management:
 * - Request-scoped data storage
 * - Automatic cleanup after request completion
 * - Memory leak prevention through weak references
 * 
 * @type {WeakMap}
 * @constant {WeakMap}
 * @memberof module:logger
 * @since 1.0.0
 * @deprecated Not currently used in implementation
 */
const requestContext = new WeakMap()

/**
 * Sets the request context (placeholder function).
 * In a more complete implementation, this would store request-specific
 * information in the requestContext WeakMap for use in log formatting.
 * 
 * Context Information:
 * - Request ID for correlation
 * - User information
 * - Session data
 * - Request metadata
 * 
 * @function setRequestContext
 * @param {object} context - The context to set.
 * @returns {object} The context object.
 * @memberof module:logger
 * @since 1.0.0
 * @deprecated Not currently used in implementation
 */
export const setRequestContext = (context) => {
  return context
}

/**
 * Custom format to include request ID in logs
 * This is a Winston format function that adds request ID information
 * to log entries when available, enabling request correlation.
 * 
 * Format Processing:
 * 1. Check for request ID in log info
 * 2. Add request ID to formatted output
 * 3. Pass through unchanged if no request ID
 * 
 * Integration Points:
 * - Works with traceability middleware
 * - Uses request ID from request object
 * - Supports manual request ID specification
 * 
 * @function requestIdFormat
 * @param {object} info - The log info object.
 * @returns {object} The modified log info object.
 * @memberof module:logger
 * @since 1.0.0
 */
const requestIdFormat = winston.format((info) => {
  // In a more advanced implementation, you would retrieve the request context here
  // For now, we'll rely on passing it explicitly
  return info
})

/**
 * The configured Winston logger instance.
 * This is the main logger object used throughout the application
 * for all logging needs. It is configured with custom formats,
 * multiple transports, and environment-specific settings.
 * 
 * Logger Configuration:
 * - Format: Custom combination of timestamp, error handling, and printf
 * - Level: 'info' by default (can be overridden by transports)
 * - Transports: Console (dev), Error File, Combined File
 * - Exception Handling: Stack trace capture for errors
 * 
 * Transport Configuration:
 * 1. Error File: Daily rotation, 20MB max size, 7-day retention
 * 2. Combined File: Daily rotation, 20MB max size, 7-day retention
 * 3. Console: Simple format for development
 * 
 * Environment Behavior:
 * - Development: Console transport enabled
 * - Production: Console transport disabled
 * 
 * @type {winston.Logger}
 * @constant {winston.Logger}
 * @memberof module:logger
 * @since 1.0.0
 * 
 * @example
 * // Log an info message
 * logger.info('User logged in', { userId: 123 });
 * 
 * @example
 * // Log an error with context
 * logger.error('Database connection failed', { 
 *   error: err.message, 
 *   requestId: 'req-abc-123' 
 * });
 */
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    requestIdFormat(),
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ level, message, timestamp, stack, requestId, ...meta }) => {
      const baseLog = `${timestamp} [${level.toUpperCase()}]${requestId ? ` [${requestId}]` : ''}: ${message}`
      const metaString = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : ''
      return stack
        ? `${baseLog}\n${stack}`
        : `${baseLog}${metaString}`
    })
  ),
  transports: [
    new DailyRotateFile({
      filename: 'logs/error.log',
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '7d'
    }),
    new DailyRotateFile({
      filename: 'logs/combined.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '7d'
    })
  ],
})

// En desarrollo: muestra logs en consola
// Development environment: display logs in console
// This provides immediate feedback during development
// while keeping file logs for persistent storage
// In production, console logs are disabled to reduce overhead
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  )
}

export default logger