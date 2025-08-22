// logger.js
import winston from 'winston'
import { format, transports } from 'winston'

// Create a weak map to store request context
const requestContext = new WeakMap()

/**
 * Function to set the current request context for logging
 * @param {Object} context - The request context containing requestId and other info
 */
export const setRequestContext = (context) => {
  // In a real implementation, you would use AsyncLocalStorage or similar
  // For now, we'll pass the context directly in log calls
  return context
}

/**
 * Custom format to include request ID in logs
 */
const requestIdFormat = format((info) => {
  // In a more advanced implementation, you would retrieve the request context here
  // For now, we'll rely on passing it explicitly
  return info
})

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
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
  ],
})

// En desarrollo: muestra logs en consola
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: winston.format.simple(),
    })
  )
}

export default logger