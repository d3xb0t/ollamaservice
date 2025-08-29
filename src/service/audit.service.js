/**
 * Audit service.
 * Records audit information for transactions in the system.
 * This module provides the business logic for creating audit log entries,
 * ensuring that all requests are properly logged for security,
 * debugging, and monitoring purposes.
 * 
 * Service Responsibilities:
 * 1. Audit Entry Creation: Create audit log entries from request data
 * 2. Data Persistence: Save audit information to database
 * 3. Error Handling: Handle audit failures gracefully
 * 4. Logging: Log audit successes and failures
 * 
 * Design Pattern: Audit Service
 * This module implements the Audit Service pattern,
 * providing a dedicated service for audit logging functionality
 * with proper error handling and separation of concerns.
 * 
 * Audit Process:
 * 1. Receive audit data from middleware/controller
 * 2. Create audit entry object
 * 3. Save to database
 * 4. Handle success/failure cases
 * 5. Log results
 * 
 * Error Handling Strategy:
 * - Log audit failures but don't interrupt main flow
 * - Re-throw errors for calling function to handle if needed
 * - Provide detailed error information for debugging
 * 
 * @file
 * @module service/audit
 * @author ChatBot Backend Team
 * @since 1.0.0
 * @copyright 2025 ChatBot Project
 * @license MIT
 * @see {@link ../models/audit.model.js} Audit Model
 */

import Audit from '../models/audit.model.js'
import logger from '../logger.js'

/**
 * Records audit information for a transaction.
 * Creates and saves an audit log entry with comprehensive request and response information.
 * 
 * Audit Data Flow:
 * 1. Receive audit information from caller
 * 2. Create new Audit model instance
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
 * @function auditTransaction
 * @param {Object} options - The audit options.
 * @param {string} options.requestId - The unique request ID.
 * @param {string} options.method - The HTTP method.
 * @param {string} options.url - The request URL.
 * @param {Object} [options.headers] - The request headers.
 * @param {Object} [options.body] - The request body.
 * @param {Object} [options.query] - The query parameters.
 * @param {Object} [options.params] - The route parameters.
 * @param {string} [options.ip] - The client's IP address.
 * @param {string} [options.userAgent] - The client's user agent.
 * @param {number} options.responseStatus - The response status code.
 * @param {number} [options.responseTime] - The response time in milliseconds.
 * @param {string} [options.userId] - The associated user ID, if available.
 * @returns {Promise<Audit>} The created audit document.
 * @throws {Error} If database operation fails and error is re-thrown
 * @memberof module:service/audit
 * @since 1.0.0
 * 
 * @example
 * // Record an audit entry
 * try {
 *   const auditEntry = await auditTransaction({
 *     requestId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
 *     method: "POST",
 *     url: "/api/chat",
 *     responseStatus: 200,
 *     responseTime: 150
 *   });
 *   console.log("Audit recorded:", auditEntry._id);
 * } catch (error) {
 *   console.error("Failed to record audit:", error);
 * }
 */
const auditTransaction = async ({
  requestId,
  method,
  url,
  headers,
  body,
  query,
  params,
  ip,
  userAgent,
  responseStatus,
  responseTime,
  userId
}) => {
  try {
    /**
     * Create a new audit entry instance.
     * Uses the Audit Mongoose model to create a new document
     * with the provided audit information.
     * 
     * Model Benefits:
     * - Schema validation
     * - Type casting
     * - Default values
     * - Middleware hooks
     * 
     * Data Mapping:
     * - Direct mapping from function parameters to model fields
     * - Optional fields handled automatically
     * - Required fields validated by schema
     */
    const auditEntry = new Audit({
      requestId,
      method,
      url,
      headers,
      body,
      query,
      params,
      ip,
      userAgent,
      responseStatus,
      responseTime,
      userId
    })

    /**
     * Save the audit entry to the database.
     * This is an asynchronous operation that persists the audit information.
     * Returns the saved document with generated ID and timestamps.
     * 
     * Database Operation:
     * - Insert new document into audits collection
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
    return await auditEntry.save()
  } catch (error) {
    /**
     * Handle audit recording failures.
     * Logs the error for monitoring and debugging purposes
     * without interrupting the main application flow.
     * 
     * Error Handling Strategy:
     * - Log error with relevant context
     * - Don't throw to avoid disrupting main flow
     * - Re-throw if calling function should handle it
     * - Provide actionable error information
     * 
     * @param {Error} error - The error that occurred during audit recording
     */
    // Log the error but don't throw to avoid disrupting the main flow
    logger.error(`Failed to audit transaction ${requestId}:`, { error })
    throw error // Re-throw if you want calling function to handle it
  }
}

export default auditTransaction