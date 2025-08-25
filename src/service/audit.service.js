import Audit from '../models/audit.model.js'

/**
 * Records audit information for a transaction.
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

    return await auditEntry.save()
  } catch (error) {
    // Log the error but don't throw to avoid disrupting the main flow
    console.error(`Failed to audit transaction ${requestId}:`, error)
    throw error // Re-throw if you want calling function to handle it
  }
}

export default auditTransaction