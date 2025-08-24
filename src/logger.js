import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
const requestContext = new WeakMap()

export const setRequestContext = (context) => {
  return context
}

/**
 * Custom format to include request ID in logs
 */
const requestIdFormat = winston.format((info) => {
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
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  )
}

export default logger