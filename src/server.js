/**
 * Server entry point.
 * Starts the Express application after connecting to the database.
 * This file is responsible for the application lifecycle management,
 * including startup, shutdown, and error handling at the process level.
 * 
 * Responsibilities:
 * 1. Database connection establishment
 * 2. HTTP server initialization and startup
 * 3. Graceful shutdown handling
 * 4. Process signal management
 * 5. Startup logging and status reporting
 * 
 * Design Pattern: Application Bootstrap
 * This module serves as the entry point that bootstraps the entire application.
 * 
 * @file
 * @module server
 * @author ChatBot Backend Team
 * @since 1.0.0
 * @copyright 2025 ChatBot Project
 * @license MIT
 * @see {@link https://nodejs.org/api/http.html#http_class_http_server} HTTP Server
 * @see {@link https://nodejs.org/api/process.html#process_process_events} Process Events
 */

import app from './app.js'
import { PORT } from './config/env.js'
import logger from './logger.js'
import { connectToDatabase } from './dbDriver/mongoDriver.js'

/**
 * Starts the application server.
 * Connects to the database and starts listening on the specified port.
 * This is an asynchronous function that handles the complete server startup sequence.
 * 
 * Startup Sequence:
 * 1. Database connection with retry logic
 * 2. HTTP server initialization
 * 3. Port binding
 * 4. Success/failure logging
 * 
 * Error Handling:
 * - Database connection failures are retried with exponential backoff
 * - Server startup failures are logged and cause process exit
 * 
 * @async
 * @function startServer
 * @returns {Promise<void>} Resolves when server is successfully started
 * @throws {Error} If database connection or server startup fails
 * @memberof module:server
 * @since 1.0.0
 * 
 * @example
 * // Start the server
 * startServer()
 *   .then(() => console.log('Server started'))
 *   .catch(err => console.error('Server failed to start:', err))
 */
const startServer = async () => {
  try {
    // Connect to the database
    // This step ensures the database is available before accepting requests
    // Uses retry logic to handle temporary connection issues
    await connectToDatabase()
    
    /**
     * HTTP server instance.
     * Created by calling app.listen() which starts the Express application
     * and binds it to the specified port. This object provides methods
     * for managing the server lifecycle.
     * 
     * Methods:
     * - listen(): Start accepting connections
     * - close(): Stop accepting new connections and close existing ones
     * - address(): Get server address information
     * 
     * Events:
     * - listening: Emitted when server starts listening
     * - error: Emitted when server encounters an error
     * - close: Emitted when server closes
     * 
     * @type {http.Server}
     * @constant {http.Server}
     * @memberof module:server
     * @since 1.0.0
     * @see {@link https://nodejs.org/api/http.html#http_class_http_server} HTTP Server
     */
    const server = app.listen(PORT, () => {
      /** 
       * Callback function executed when the server starts listening.
       * Logs a message to the console indicating that the server is running.
       * Provides essential startup information for monitoring and debugging.
       * 
       * Information logged:
       * - Server status confirmation
       * - Port number
       * - Timestamp of startup
       * 
       * @memberof module:server
       * @since 1.0.0
       */
      logger.info(`Server is running on port ${PORT}`, { 
        port: PORT,
        timestamp: new Date().toISOString()
      })
      logger.info(`Servidor corriendo en el puerto ${PORT}`)
    })

    /** 
     * Handle graceful shutdown of the server.
     * Listens for SIGINT signal (Ctrl+C) to perform clean shutdown operations.
     * Ensures all pending requests are completed and resources are properly released.
     * 
     * Shutdown Sequence:
     * 1. Log shutdown initiation
     * 2. Close HTTP server
     * 3. Log server closure
     * 4. Exit process with success code
     * 
     * @memberof module:server
     * @since 1.0.0
     * @see {@link https://nodejs.org/api/process.html#process_signal_events} Signal Events
     */
    process.on('SIGINT', () => {
      logger.info('Shutting down server...')
      server.close(() => {
        logger.info('Server closed')
        process.exit(0)
      })
    })
  } catch (error) {
    /**
     * Handle startup errors.
     * Catches any errors that occur during the startup process.
     * Logs the error and exits the process with an error code.
     * 
     * Error Types:
     * - Database connection failures
     * - Port binding failures
     * - Configuration errors
     * 
     * @param {Error} error - The error that occurred during startup
     * @memberof module:server
     * @since 1.0.0
     */
    logger.error('Failed to start server', { error: error.message })
    process.exit(1)
  }
}

// Execute the startServer function to bootstrap the application
// This is the entry point that initiates the entire application startup sequence
startServer()