/**
 * Environment variable configuration.
 * Loads environment variables and exports them for use throughout the application.
 * @file
 * @module config/env
 */

import dotenv from 'dotenv'
import logger from '../logger.js'

// Load environment variables from .env file
dotenv.config()

/**
 * The port number on which the server will listen.
 * @type {string|undefined}
 */
export const PORT = process.env.PORT

/**
 * The current Node.js environment.
 * @type {string}
 * @default 'development'
 */
export const NODE_ENV = process.env.NODE_ENV || 'development'

/**
 * The version of the application.
 * @type {string}
 * @default '1.0.0'
 */
export const VERSION = process.env.VERSION || '1.0.0'

// Log that environment variables have been loaded
logger.info('Environment variables loaded', { 
  NODE_ENV, 
  PORT: PORT ? 'Defined' : 'Not defined', 
  VERSION 
})