/**
 * MongoDB driver and connection management.
 * Handles connecting to MongoDB with retry logic and provides a connection middleware.
 * This module provides robust database connectivity with automatic retry mechanisms
 * and connection state management to ensure reliable database access.
 * 
 * Database Connection Features:
 * 1. Automatic Retry Logic: Reconnects on connection failures
 * 2. Connection State Management: Tracks connected/disconnected states
 * 3. Configuration Management: Environment-based configuration
 * 4. Event Handling: Listens for connection events
 * 5. Graceful Shutdown: Properly closes connections
 * 6. Middleware Integration: Express middleware for connection checking
 * 
 * Design Pattern: Database Connection Manager
 * This module implements the Database Connection Manager pattern,
 * providing centralized control over database connectivity with
 * robust error handling and recovery mechanisms.
 * 
 * Retry Strategy:
 * - Maximum retries: Configurable via environment (default: 5)
 * - Retry delay: Configurable via environment (default: 5000ms)
 * - Exponential backoff: Not implemented (fixed delay)
 * - Error logging: Detailed error information
 * 
 * Connection Management:
 * - Singleton connection pattern
 * - Lazy initialization
 * - State tracking
 * - Automatic reconnection
 * 
 * Event Handling:
 * - Connected: Logs successful connections
 * - Disconnected: Updates connection state
 * - Error: Logs database errors
 * - SIGINT: Graceful shutdown handling
 * 
 * @file
 * @module dbDriver/mongoDriver
 * @author ChatBot Backend Team
 * @since 1.0.0
 * @copyright 2025 ChatBot Project
 * @license MIT
 * @see {@link https://mongoosejs.com/} Mongoose ODM
 * @see {@link https://mongodb.github.io/node-mongodb-native/} MongoDB Native Driver
 */

import mongoose from 'mongoose'
import logger from '../logger.js'
import { setTimeout } from 'timers/promises'

// Configuration for database connection with retry logic
// These values can be overridden via environment variables
// providing flexibility for different deployment environments

/**
 * MongoDB connection URI.
 * This is the connection string used to connect to the MongoDB database.
 * Can be overridden with the MONGODB_URI environment variable.
 * 
 * URI Format:
 * - mongodb://[username:password@]host1[:port1][,...hostN[:portN]][/[database][?options]]
 * 
 * Default Configuration:
 * - Host: localhost
 * - Port: 27017
 * - Database: chatbot
 * 
 * Security Considerations:
 * - Should include authentication in production
 * - Should use SSL/TLS in production
 * - Should be stored securely (environment variables)
 * 
 * @type {string}
 * @constant {string}
 * @memberof module:dbDriver/mongoDriver
 * @since 1.0.0
 */
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chatbot'

/**
 * Maximum number of retry attempts for database connection.
 * This determines how many times the application will attempt to reconnect
 * to the database after a connection failure before giving up.
 * 
 * Retry Behavior:
 * - Each retry is separated by RETRY_DELAY milliseconds
 * - After MAX_RETRIES attempts, the application will exit
 * - Failed retries are logged for monitoring
 * 
 * Configuration:
 * - Environment variable: MONGO_MAX_RETRIES
 * - Default value: 5
 * - Type: Number
 * 
 * @type {number}
 * @constant {number}
 * @memberof module:dbDriver/mongoDriver
 * @since 1.0.0
 */
const MAX_RETRIES = process.env.MONGO_MAX_RETRIES || 5

/**
 * Delay between retry attempts in milliseconds.
 * This determines how long to wait between database connection retry attempts.
 * 
 * Timing Strategy:
 * - Fixed delay (not exponential backoff)
 * - Configurable via environment
 * - Default: 5000ms (5 seconds)
 * 
 * Performance Considerations:
 * - Not too short (avoids overwhelming database)
 * - Not too long (allows for quick recovery)
 * - Consistent for predictable behavior
 * 
 * @type {number}
 * @constant {number}
 * @memberof module:dbDriver/mongoDriver
 * @since 1.0.0
 */
const RETRY_DELAY = process.env.MONGO_RETRY_DELAY || 5000 // milisegundos

/**
 * Connection state tracking.
 * Tracks whether the application is currently connected to the database.
 * Used to prevent duplicate connection attempts and to determine
 * if middleware should attempt to connect.
 * 
 * State Values:
 * - true: Connected to database
 * - false: Not connected to database
 * 
 * State Management:
 * - Set to true on successful connection
 * - Set to false on disconnection
 * - Checked before connection attempts
 * 
 * @type {boolean}
 * @memberof module:dbDriver/mongoDriver
 * @since 1.0.0
 */
let isConnected = false

/**
 * Retry attempt counter.
 * Tracks the number of consecutive failed connection attempts.
 * Reset to zero on successful connection.
 * 
 * Counter Management:
 * - Incremented on connection failure
 * - Reset to zero on successful connection
 * - Compared against MAX_RETRIES to determine when to give up
 * 
 * @type {number}
 * @memberof module:dbDriver/mongoDriver
 * @since 1.0.0
 */
let retryCount = 0

/**
 * Connects to the database MongoDB with retry logic.
 * This function handles the complete database connection process,
 * including retry attempts and error handling.
 * 
 * Connection Process:
 * 1. Check if already connected
 * 2. Attempt to connect to MongoDB
 * 3. Handle connection success
 * 4. Handle connection failure with retry
 * 5. Update connection state
 * 
 * Retry Logic:
 * - Attempts up to MAX_RETRIES times
 * - Waits RETRY_DELAY milliseconds between attempts
 * - Logs each retry attempt
 * - Exits process after MAX_RETRIES failures
 * 
 * Configuration Options:
 * - serverSelectionTimeoutMS: 5000 (5 seconds)
 * - socketTimeoutMS: 45000 (45 seconds)
 * 
 * Error Handling:
 * - Connection errors are caught and logged
 * - Retry attempts are tracked
 * - Process exits after maximum retries
 * 
 * @async
 * @function connectToDatabase
 * @returns {Promise<void>} Promise that resolves when connection is established
 * @throws {Error} If connection fails after maximum retries
 * @memberof module:dbDriver/mongoDriver
 * @since 1.0.0
 * 
 * @example
 * // Connect to database
 * try {
 *   await connectToDatabase();
 *   console.log('Connected to database');
 * } catch (error) {
 *   console.error('Database connection failed:', error);
 * }
 */
const connectToDatabase = async () => {
  // Check if already connected to avoid duplicate connections
  // This prevents unnecessary connection attempts and resource usage
  // Early return for better performance
  if (isConnected) {
    logger.info('Ya conectado a la base de datos MongoDB')
    return
  }

  try {
    // Log connection attempt for monitoring purposes
    // Provides visibility into database connectivity status
    logger.info(`Intentando conectar a MongoDB: ${MONGO_URI}`)
    
    // Attempt to connect to MongoDB with configuration options
    // Uses mongoose.connect for promise-based connection handling
    // Configuration options optimize timeout behavior
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of default 30s
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    })

    // Update connection state on successful connection
    // Reset retry counter and mark as connected
    // This prevents future unnecessary connection attempts
    isConnected = true
    retryCount = 0
    logger.info('Conexión exitosa a MongoDB')
  } catch (error) {
    // Log connection error for troubleshooting
    // Includes error message for debugging connectivity issues
    logger.error('Error conectando a MongoDB:', { error: error.message })
    
    // Implement retry logic for connection failures
    // Attempts to reconnect up to MAX_RETRIES times
    // Waits RETRY_DELAY milliseconds between attempts
    if (retryCount < MAX_RETRIES) {
      // Increment retry counter for tracking attempts
      retryCount++
      
      // Log retry attempt for monitoring
      // Includes attempt number and delay information
      logger.info(`Reintentando conexión en ${RETRY_DELAY}ms... (Intento ${retryCount}/${MAX_RETRIES})`)
      
      // Wait before retrying to avoid overwhelming the database
      // Uses setTimeout promise for non-blocking delay
      await setTimeout(RETRY_DELAY)
      
      // Recursively attempt to connect again
      // This continues the retry loop until success or max retries
      return connectToDatabase()
    } else {
      // Log final failure after maximum retries exceeded
      // Indicates that connection could not be established
      logger.error('No se pudo conectar a MongoDB después de múltiples intentos')
      
      // Throw error to indicate connection failure
      // This allows calling functions to handle the failure appropriately
      throw new Error('Fallo en la conexión a la base de datos')
    }
  }
}

/**
 * Closes the connection to the database.
 * This function gracefully closes the database connection,
 * ensuring that all pending operations are completed.
 * 
 * Shutdown Process:
 * 1. Close mongoose connection
 * 2. Update connection state
 * 3. Log disconnection
 * 4. Handle errors
 * 
 * Use Cases:
 * - Application shutdown
 * - Database maintenance
 * - Connection cleanup
 * 
 * Error Handling:
 * - Connection close errors are logged
 * - Does not throw to prevent shutdown interruption
 * 
 * @async
 * @function disconnectFromDatabase
 * @returns {Promise<void>} Promise that resolves when disconnection is complete
 * @memberof module:dbDriver/mongoDriver
 * @since 1.0.0
 * 
 * @example
 * // Disconnect from database
 * await disconnectFromDatabase();
 */
const disconnectFromDatabase = async () => {
  try {
    // Close the mongoose connection gracefully
    // This ensures all pending operations are completed
    // and resources are properly released
    await mongoose.connection.close()
    
    // Update connection state to reflect disconnection
    // This prevents attempts to use closed connections
    isConnected = false
    
    // Log successful disconnection for monitoring
    // Provides visibility into database connectivity status
    logger.info('Desconectado de MongoDB')
  } catch (error) {
    // Log disconnection errors for troubleshooting
    // Does not throw to avoid interrupting shutdown process
    logger.error('Error al desconectar de MongoDB:', { error: error.message })
  }
}

/**
 * Middleware to verify connection before processing requests.
 * This Express middleware ensures that a database connection
 * is available before allowing requests to proceed to business logic.
 * 
 * Middleware Process:
 * 1. Check connection state
 * 2. Attempt connection if not connected
 * 3. Continue to next middleware on success
 * 4. Send error response on failure
 * 
 * Benefits:
 * - Prevents requests from failing due to disconnected database
 * - Automatically attempts to reconnect
 * - Provides consistent error responses
 * - Improves user experience
 * 
 * @async
 * @function databaseConnectionMiddleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Promise that resolves when middleware processing is complete
 * @memberof module:dbDriver/mongoDriver
 * @since 1.0.0
 * 
 * @example
 * // Use as Express middleware
 * app.use(databaseConnectionMiddleware);
 */
const databaseConnectionMiddleware = async (req, res, next) => {
  // Check if database is currently connected
  // This is a fast check that avoids unnecessary connection attempts
  if (!isConnected) {
    try {
      // Attempt to connect to database if not connected
      // This provides automatic recovery from disconnections
      await connectToDatabase()
    } catch (error) {
      // Log connection error for monitoring
      // Includes error message for debugging
      logger.error('No se puede conectar a la base de datos en middleware:', { error: error.message })
      
      // Send error response when database connection fails
      // Prevents requests from proceeding without database access
      // Status 500 indicates server error
      return res.status(500).json({ error: 'Error de conexión a la base de datos' })
    }
  }
  // Continue to next middleware on successful connection
  // Indicates that database access is available
  next()
}

// Event listeners for the connection of Mongoose
/**
 * Event handler for when Mongoose connection is established.
 * Logs successful connection events for monitoring purposes.
 * 
 * Event Characteristics:
 * - Triggered on initial connection
 * - Triggered on reconnection after disconnection
 * - Provides confirmation of database availability
 * 
 * @event mongoose#connected
 * @memberof module:dbDriver/mongoDriver
 * @since 1.0.0
 */
mongoose.connection.on('connected', () => {
  logger.info('Mongoose conexión establecida')
})

/**
 * Event handler for when Mongoose connection is lost.
 * Updates connection state and logs disconnection events.
 * 
 * Event Characteristics:
 * - Triggered on unexpected disconnections
 * - Triggered on explicit disconnections
 * - Updates application connection state
 * 
 * State Management:
 * - Sets isConnected to false
 * - Allows for automatic reconnection attempts
 * - Prevents use of stale connections
 * 
 * @event mongoose#disconnected
 * @memberof module:dbDriver/mongoDriver
 * @since 1.0.0
 */
mongoose.connection.on('disconnected', () => {
  isConnected = false
  logger.warn('Mongoose conexión perdida')
})

/**
 * Event handler for Mongoose connection errors.
 * Logs connection errors for troubleshooting and monitoring.
 * 
 * Error Characteristics:
 * - Network connectivity issues
 * - Authentication failures
 * - Database server problems
 * - Configuration errors
 * 
 * Error Handling:
 * - Logs error details for debugging
 * - Does not attempt automatic recovery
 * - Allows other error handling mechanisms to respond
 * 
 * @event mongoose#error
 * @param {Error} error - Error object with connection details
 * @memberof module:dbDriver/mongoDriver
 * @since 1.0.0
 */
mongoose.connection.on('error', (error) => {
  logger.error('Error en conexión Mongoose:', { error })
})

// Handle application shutdown events
/**
 * Handler for SIGINT signal that closes the database connection.
 * Ensures graceful shutdown of database connections when application exits.
 * 
 * Shutdown Process:
 * 1. Close database connection
 * 2. Exit process with success code
 * 
 * Signal Information:
 * - SIGINT: Interrupt signal (Ctrl+C)
 * - Common method for terminating applications
 * - Allows for cleanup before exit
 * 
 * @event process#SIGINT
 * @memberof module:dbDriver/mongoDriver
 * @since 1.0.0
 */
process.on('SIGINT', async () => {
  await disconnectFromDatabase()
  process.exit(0)
})

export {
  connectToDatabase,
  disconnectFromDatabase,
  databaseConnectionMiddleware
}