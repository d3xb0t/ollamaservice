import ErrorAudit from '../models/errorAudit.model.js'
import logger from '../logger.js'

/**
 * Records error audit information.
 * @param {Object} options - The error audit options.
 * @param {string} options.requestId - The unique request ID.
 * @param {Error} options.error - The error object.
 * @param {Object} options.request - The request object details.
 * @returns {Promise<ErrorAudit>} The created error audit document.
 */
const auditError = async ({ requestId, error, request }) => {
  try {
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

    return await errorEntry.save()
  } catch (auditError) {
    // Log the error but don't throw to avoid disrupting the main error flow
    logger.error(`Failed to audit error ${requestId}:`, { error: auditError })
    // Depending on requirements, you might want to re-throw or handle differently
    throw auditError
  }
}

export default auditError