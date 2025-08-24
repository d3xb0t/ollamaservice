import dotenv from 'dotenv'
import logger from '../logger.js'

dotenv.config()

export const PORT = process.env.PORT

export const NODE_ENV = process.env.NODE_ENV || 'development'

export const VERSION = process.env.VERSION || '1.0.0'

logger.info('Environment variables loaded', { 
  NODE_ENV, 
  PORT: PORT ? 'Defined' : 'Not defined',
  VERSION 
})