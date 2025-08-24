/**
 * Server entry point.
 * Starts the Express application after connecting to the database.
 * @file
 * @module server
 */

import app from './app.js'
import { PORT } from './config/env.js'
import logger from './logger.js'
import { connectToDatabase } from './dbDriver/mongoDriver.js'

/**
 * Starts the application server.
 * Connects to the database and starts listening on the specified port.
 * @async
 * @function startServer
 * @returns {Promise<void>}
 */
const startServer = async () => {
  try {
    // Connect to the database
    await connectToDatabase()
    
    /**
     * HTTP server instance.
     * @type {http.Server}
     */
    const server = app.listen(PORT, () => {
      /** 
       * Callback function executed when the server starts listening.
       * Logs a message to the console indicating that the server is running.
       */
      logger.info(`Server is running on port ${PORT}`, { 
        port: PORT,
        timestamp: new Date().toISOString()
      })
      console.log(`Servidor corriendo en el puerto ${PORT}`)
    })

    /** 
     * Handle graceful shutdown of the server.
     * Closes the server connection and exits the process.
     */
    process.on('SIGINT', () => {
      logger.info('Shutting down server...')
      server.close(() => {
        logger.info('Server closed')
        process.exit(0)
      })
    })
  } catch (error) {
    logger.error('Failed to start server:', { error: error.message })
    process.exit(1)
  }
}

// Start the application
startServer()