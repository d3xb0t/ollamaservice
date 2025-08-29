/**
 * Error audit service.
 * Records error audit information in the system.
 * This module provides the business logic for creating error audit log entries,
 * ensuring that all errors are properly logged for debugging,
 * monitoring, and system reliability purposes.
 * 
 * Service Responsibilities:
 * 1. Error Entry Creation: Create error audit log entries from error data
 * 2. Data Persistence: Save error information to database
 * 3. Error Handling: Handle error audit failures gracefully
 * 4. Logging: Log error audit successes and failures
 * 
 * Design Pattern: Error Audit Service
 * This module implements the Error Audit Service pattern,
 * providing a dedicated service for error logging functionality
 * with proper error handling and separation of concerns.
 * 
 * Error Audit Process:
 * 1. Receive error data from error handler
 * 2. Create error audit entry object
 * 3. Save to database
 * 4. Handle success/failure cases
 * 5. Log results
 * 
 * Error Handling Strategy:
 * - Log error audit failures but don't interrupt error flow
 * - Re-throw errors for calling function to handle if needed
 * - Provide detailed error information for debugging
 * 
 * @file
 * @module service/errorAudit
 * @author ChatBot Backend Team
 * @since 1.0.0
 * @copyright 2025 ChatBot Project
 * @license MIT
 * @see {@link ../models/errorAudit.model.js} Error Audit Model
 * @see {@link ../errors.js} Error Handler Middleware
 */

import ErrorAudit from '../models/errorAudit.model.js'
import logger from '../logger.js'

/**
 * Records error audit information.
 * Creates and saves an error audit log entry with comprehensive error and request information.
 * 
 * Error Audit Data Flow:
 * 1. Receive error and request information from caller
 * 2. Create new ErrorAudit model instance
 * 3. Populate with provided data
 * 4. Save to MongoDB collection
 * 5. Handle success or failure
 * 6. Return saved document or handle error
 * 
 * Data Persistence:
 * - Uses Mongoose model for data validation
 * - Asynchronous database operation
 * - Returns Promise with saved document
 * - Handles database errors gracefully
 * 
 * Performance Considerations:
 * - Database write operation
 * - Non-blocking async/await pattern
 * - Minimal data transformation
 * - Error handling without blocking
 * 
 * @async
 * @function auditError
 * @param {Object} options - The error audit options.
 * @param {string} options.requestId - The unique request ID.
 * @param {Error} options.error - The error object.
 * @param {Object} options.request - The request object details.
 * @returns {Promise<ErrorAudit>} The created error audit document.
 * @throws {Error} If database operation fails and error is re-thrown
 * @memberof module:service/errorAudit
 * @since 1.0.0
 * 
 * @example
 * // Record an error audit entry
 * try {
 *   const errorEntry = await auditError({
 *     requestId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
 *     error: new Error("Database connection failed"),
 *     request: {
 *       method: "POST",
 *       url: "/api/chat",
 *       body: { prompt: "Hello" }
 *     }
 *   });
 *   console.log("Error audit recorded:", errorEntry._id);
 * } catch (auditError) {
 *   console.error("Failed to record error audit:", auditError);
 * }
 */
const auditError = async ({ requestId, error, request }) => {
  try {
    /**
     * Create a new error audit entry instance.
     * Uses the ErrorAudit Mongoose model to create a new document
     * with the provided error and request information.
     * 
     * Model Benefits:
     * - Schema validation
     * - Type casting
     * - Default values
     * - Middleware hooks
     * 
     * Data Mapping:
     * - Error object mapped to error subdocument
     * - Request object mapped to request subdocument
     * - requestId mapped to top-level field
     * - timestamp automatically set by schema
     */
    const errorEntry = new ErrorAudit({
      requestId,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        statusCode: error.statusCode
      },
      request: {
        method: request.method,
        url: request.url,
        headers: request.headers,
        body: request.body,
        query: request.query,
        params: request.params,
        ip: request.ip || request.connection?.remoteAddress,
        userAgent: request.get?.('User-Agent')
      }
    })

    /**
     * Save the error audit entry to the database.
     * This is an asynchronous operation that persists the error information.
     * Returns the saved document with generated ID and timestamps.
     * 
     * Database Operation:
     * - Insert new document into erroraudits collection
     * - Apply schema validation
     * - Generate MongoDB document ID
     * - Return saved document
     * 
     * Error Cases:
     * - Database connectivity issues
     * - Schema validation failures
     * - Duplicate key violations (unlikely with UUID)
     * - Permission issues
     */
    return await errorEntry.save()
  } catch (auditError) {
    /**
     * Handle error audit recording failures.
     * Logs the error for monitoring and debugging purposes
     * without interrupting the main error handling flow.
     * 
     * Error Handling Strategy:
     * - Log error with relevant context
     * - Don't throw to avoid disrupting the main error flow
     * - Re-throw if calling function should handle it
     * - Provide actionable error information
     * 
     * @param {Error} auditError - The error that occurred during error audit recording
     */
    // Log the error but don't throw to avoid disrupting the main error flow
    logger.error(`Failed to audit error ${requestId}:`, { error: auditError })
    // Depending on requirements, you might want to re-throw or handle differently
    throw auditError
  }
}

export default auditError