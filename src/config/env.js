/**
 * Environment variable configuration.
 * Loads environment variables and exports them for use throughout the application.
 * This module provides a centralized location for all environment-based configuration,
 * ensuring consistent access to configuration values across the application.
 * 
 * Configuration Management Pattern: Environment-based Configuration
 * This approach separates configuration from code, allowing different environments
 * (development, staging, production) to use different settings without code changes.
 * 
 * Environment Variables Loaded:
 * - PORT: Server port number (default: undefined)
 * - NODE_ENV: Application environment (default: 'development')
 * - VERSION: Application version (default: '1.0.0')
 * - MONGODB_URI: MongoDB connection string (default: 'mongodb://localhost:27017/chatbot')
 * - MONGO_MAX_RETRIES: Database connection retry attempts (default: 5)
 * - MONGO_RETRY_DELAY: Delay between retries in milliseconds (default: 5000)
 * 
 * @file
 * @module config/env
 * @author ChatBot Backend Team
 * @since 1.0.0
 * @copyright 2025 ChatBot Project
 * @license MIT
 * @see {@link https://www.npmjs.com/package/dotenv} dotenv package
 */

import dotenv from 'dotenv'
import logger from '../logger.js'

// Load environment variables from .env file
// This loads environment variables from the .env file in the project root
// into process.env, making them available throughout the application
// The dotenv package automatically parses the file and sets the variables
dotenv.config()

/**
 * The port number on which the server will listen.
 * This value determines which TCP port the HTTP server will bind to.
 * Can be set via the PORT environment variable.
 * 
 * Valid Values:
 * - Any valid TCP port number (1-65535)
 * - undefined (system will assign an available port)
 * 
 * Security Considerations:
 * - Ports below 1024 require administrative privileges
 * - Production environments should use standard ports (80, 443) or reverse proxy
 * 
 * @type {string|undefined}
 * @constant {string|undefined}
 * @memberof module:config/env
 * @since 1.0.0
 * @default undefined
 */
export const PORT = process.env.PORT

/**
 * The current Node.js environment.
 * This value determines the application's behavior in different deployment contexts.
 * Affects logging levels, error handling, and other environment-specific behavior.
 * 
 * Standard Values:
 * - 'development': Development environment with verbose logging
 * - 'production': Production environment with optimized settings
 * - 'test': Testing environment with specialized configurations
 * 
 * Behavior Differences:
 * - Development: Detailed logging, stack traces in responses
 * - Production: Minimal logging, no stack traces in responses
 * - Test: Special configurations for automated testing
 * 
 * @type {string}
 * @constant {string}
 * @memberof module:config/env
 * @since 1.0.0
 * @default 'development'
 */
export const NODE_ENV = process.env.NODE_ENV || 'development'

/**
 * The version of the application.
 * This value is used for API versioning, logging, and documentation.
 * Should be updated with each release following semantic versioning.
 * 
 * Format: Semantic Versioning (MAJOR.MINOR.PATCH)
 * - MAJOR: Incompatible API changes
 * - MINOR: Backward compatible functionality additions
 * - PATCH: Backward compatible bug fixes
 * 
 * Usage:
 * - API documentation version
 * - Response headers
 * - Log entries
 * - Health check responses
 * 
 * @type {string}
 * @constant {string}
 * @memberof module:config/env
 * @since 1.0.0
 * @default '1.0.0'
 * @see {@link https://semver.org/} Semantic Versioning
 */
export const VERSION = process.env.VERSION || '1.0.0'

// Log that environment variables have been loaded
// This provides confirmation that configuration loading was successful
// and displays the current environment settings for debugging purposes
// Information is logged at INFO level to ensure it appears in standard logs
logger.info('Environment variables loaded', { 
  NODE_ENV, 
  PORT: PORT ? 'Defined' : 'Not defined', 
  VERSION 
})