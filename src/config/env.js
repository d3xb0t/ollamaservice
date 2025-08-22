import dotenv from 'dotenv'

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