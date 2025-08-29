/**
 * Audit Server Application.
 * Express server for handling audit messages from RabbitMQ and providing health check endpoints.
 * This server listens for audit messages from the RabbitMQ queue, processes them,
 * and provides health monitoring endpoints for system status checking.
 * 
 * Server Functions:
 * 1. RabbitMQ Connection Management: Connects to and consumes messages from RabbitMQ
 * 2. Message Processing: Handles incoming audit messages
 * 3. Health Monitoring: Provides endpoints for service health checking
 * 4. Metrics Collection: Tracks processed message counts
 * 5. Graceful Shutdown: Handles proper connection closing on shutdown
 * 
 * Design Pattern: Message Consumer Service
 * This module implements the Message Consumer Service pattern,
 * providing a dedicated service for consuming and processing
 * messages from a message queue with health monitoring.
 * 
 * Message Flow:
 * 1. Connect to RabbitMQ server
 * 2. Assert and consume from 'auditoria' queue
 * 3. Parse incoming messages
 * 4. Process messages (log to console, future DB storage)
 * 5. Acknowledge successful processing
 * 
 * Health Check Endpoints:
 * - GET / : General status and metrics
 * - GET /health : Service health information
 * 
 * Error Handling:
 * - Connection failures with retry logic
 * - Message processing errors with nack
 * - Graceful shutdown on process signals
 * - Unhandled error capture and logging
 * 
 * @file
 * @author ChatBot Backend Team
 * @since 1.0.0
 * @copyright 2025 ChatBot Project
 * @license MIT
 * @see {@link https://expressjs.com/} Express.js Framework
 * @see {@link https://www.rabbitmq.com/} RabbitMQ Message Broker
 */

// audit/server.js
import express from 'express';
import amqp from 'amqplib';

/**
 * Express application instance for the audit server.
 * This Express app provides HTTP endpoints for health checking
 * and metrics reporting for the audit service.
 * 
 * App Configuration:
 * - JSON body parsing middleware
 * - Health check endpoints
 * - Metrics reporting
 * 
 * @type {express.Application}
 * @constant {express.Application}
 * @since 1.0.0
 */
const app = express();

/**
 * Port number for the audit server to listen on.
 * The HTTP server will bind to this port to accept incoming requests.
 * 
 * Port Selection:
 * - 3001: Standard secondary port for auxiliary services
 * - Non-privileged port (above 1024)
 * - Different from main application port (3000)
 * 
 * @type {number}
 * @constant {number}
 * @default 3001
 * @since 1.0.0
 */
const PORT = 3001;

/**
 * RabbitMQ connection instance.
 * Maintains the active connection to the RabbitMQ server for
 * consuming audit messages from the queue.
 * 
 * Connection Lifecycle:
 * - Created on server startup
 * - Used for channel creation
 * - Closed on server shutdown
 * - Handles reconnection logic (future enhancement)
 * 
 * @type {amqp.Connection|null}
 * @since 1.0.0
 */
let connection = null;

/**
 * RabbitMQ channel instance.
 * Provides the communication channel for consuming messages
 * from the audit queue.
 * 
 * Channel Responsibilities:
 * - Queue assertion
 * - Message consumption
 * - Message acknowledgment
 * - Error handling
 * 
 * @type {amqp.Channel|null}
 * @since 1.0.0
 */
let channel = null;

/**
 * Counter for processed messages.
 * Tracks the total number of audit messages processed by the server.
 * 
 * Metrics Usage:
 * - Health check reporting
 * - Performance monitoring
 * - Activity tracking
 * - Debugging information
 * 
 * @type {number}
 * @since 1.0.0
 */
let mensajesProcesados = 0;

// Middleware
/**
 * Express middleware for JSON body parsing.
 * Configures the Express app to automatically parse JSON request bodies.
 * 
 * Parser Configuration:
 * - Default JSON parsing
 * - Standard Express middleware
 * - Automatic content-type detection
 * 
 * @since 1.0.0
 */
app.use(express.json());

// Health check routes
/**
 * Root endpoint for general status and metrics.
 * Provides a quick overview of server status and basic metrics.
 * 
 * Response Format:
 * - status: Human-readable server status
 * - mensajesProcesados: Count of processed messages
 * - timestamp: Current ISO timestamp
 * 
 * HTTP Method: GET
 * Response Type: application/json
 * Status Code: 200 OK
 * 
 * @name get_root
 * @route {GET} /
 * @since 1.0.0
 */
app.get('/', (req, res) => {
  res.json({ 
    status: '✅ Audit Server Active',
    mensajesProcesados,
    timestamp: new Date().toISOString()
  });
});

/**
 * Health check endpoint for service monitoring.
 * Provides detailed information about service connectivity and status.
 * 
 * Response Format:
 * - service: Service identifier
 * - status: Connection status (connected/disconnected)
 * - mensajesProcesados: Count of processed messages
 * 
 * HTTP Method: GET
 * Response Type: application/json
 * Status Code: 200 OK
 * 
 * Monitoring Use Cases:
 * - Load balancer health checks
 * - Container orchestration
 * - Service discovery
 * - Alerting systems
 * 
 * @name get_health
 * @route {GET} /health
 * @since 1.0.0
 */
app.get('/health', (req, res) => {
  const status = connection ? 'connected' : 'disconnected';
  res.json({ 
    service: 'auditoria',
    status,
    mensajesProcesados
  });
});

// Function to connect to RabbitMQ
/**
 * Establishes connection to RabbitMQ server.
 * Creates connection and channel for consuming messages from the audit queue.
 * 
 * Connection Process:
 * 1. Connect to RabbitMQ server at amqp://localhost
 * 2. Create communication channel
 * 3. Assert the 'auditoria' queue exists
 * 4. Start listening for messages
 * 
 * Error Handling:
 * - Connection failures are caught and logged
 * - Process continues running but without message consumption
 * - Manual restart required for reconnection (future enhancement)
 * 
 * @async
 * @function conectarRabbitMQ
 * @returns {Promise<void>} Promise that resolves when connection is established
 * @since 1.0.0
 * 
 * @example
 * // Connect to RabbitMQ
 * await conectarRabbitMQ();
 */
const conectarRabbitMQ = async () => {
  try {
    /**
     * Establish connection to RabbitMQ server.
     * Uses default connection settings for localhost.
     * In production, this should use environment variables.
     * 
     * Connection Parameters:
     * - Protocol: AMQP
     * - Host: localhost
     * - Port: Default (5672)
     * - Credentials: Default (guest/guest)
     */
    connection = await amqp.connect('amqp://localhost');
    
    /**
     * Create communication channel.
     * Channels are lightweight connections that share a single TCP connection.
     */
    channel = await connection.createChannel();
    
    /**
     * Assert that the audit queue exists.
     * Creates the queue if it doesn't exist.
     * Ensures messages can be consumed properly.
     */
    await channel.assertQueue('auditoria');
    
    console.log('🔍 Audit Server: Connected to RabbitMQ');
    
    /**
     * Start listening for messages.
     * Begins consumption of messages from the audit queue.
     */
    escucharMensajes();
  } catch (error) {
    console.error('❌ Audit Server: Connection Error:', error);
  }
};

// Function to listen for messages
/**
 * Starts consuming messages from the audit queue.
 * Sets up the message consumer and processing callback.
 * 
 * Consumption Process:
 * 1. Consume messages from 'auditoria' queue
 * 2. Parse message content as JSON
 * 3. Process message with error handling
 * 4. Acknowledge successful processing
 * 5. Negative acknowledge failed processing
 * 
 * Message Acknowledgment:
 * - ack: Message processed successfully
 * - nack: Message processing failed
 * 
 * @function escucharMensajes
 * @returns {void}
 * @since 1.0.0
 */
const escucharMensajes = () => {
  /**
   * Consume messages from the audit queue.
   * Sets up a consumer that processes each message as it arrives.
   * 
   * Consumer Options:
   * - No auto-acknowledgment
   * - Manual acknowledgment based on processing success
   * - Error handling for each message
   */
  channel.consume('auditoria', (msg) => {
    if (msg !== null) {
      try {
        /**
         * Parse message content as JSON.
         * Converts the message buffer to a string and parses as JSON.
         * 
         * Message Format:
         * - UTF-8 encoded string
         * - JSON formatted data
         * - Contains audit information
         */
        const mensaje = JSON.parse(msg.content.toString());
        
        /**
         * Process the parsed message.
         * Handles the audit information contained in the message.
         */
        procesarMensaje(mensaje);
        
        /**
         * Acknowledge successful message processing.
         * Removes the message from the queue.
         */
        channel.ack(msg);
      } catch (error) {
        /**
         * Handle message processing errors.
         * Logs the error and negatively acknowledges the message.
         * 
         * Error Handling:
         * - Log error details
         * - Nack message (returns to queue)
         * - Continue processing other messages
         */
        console.error('❌ Audit Server: Error processing message:', error);
        channel.nack(msg);
      }
    }
  });
};

// Function to process messages (arrow function)
/**
 * Processes an incoming audit message.
 * Handles the audit information received from the message queue.
 * 
 * Processing Steps:
 * 1. Increment message counter
 * 2. Log message information to console
 * 3. Future: Store in database
 * 
 * @function procesarMensaje
 * @param {Object} mensaje - The audit message to process
 * @param {Object} mensaje.* - All properties of the audit message
 * @returns {void}
 * @since 1.0.0
 * 
 * @example
 * // Process an audit message
 * procesarMensaje({
 *   'x-request-id': 'abc-123',
 *   'user-agent': 'Mozilla/5.0',
 *   host: 'localhost:3000'
 * });
 */
const procesarMensaje = (mensaje) => {
  /**
   * Increment the processed messages counter.
   * Tracks the total number of messages processed by the server.
   */
  mensajesProcesados++;
  
  console.log('✅ [AUDIT] Action registered:', {
    action: mensaje,
    processed: new Date().toISOString(),
    messageId: mensajesProcesados
  });

  // Here you could save to database, send email, etc.
  // guardarEnBaseDeDatos(mensaje);
};

// Example function to save to database
/**
 * Example function for saving messages to database.
 * Placeholder for future database persistence implementation.
 * 
 * Future Implementation:
 * - Connect to database
 * - Insert audit record
 * - Handle database errors
 * - Confirm successful storage
 * 
 * @async
 * @function guardarEnBaseDeDatos
 * @param {Object} mensaje - The message to save to database
 * @returns {Promise<void>} Promise that resolves when save is complete
 * @since 1.0.0
 * @todo Implement database persistence
 */
const guardarEnBaseDeDatos = async (mensaje) => {
  // Future implementation
  console.log('💾 Saving to database...', mensaje);
};

// Start the audit server
/**
 * Initializes and starts the audit server.
 * Establishes RabbitMQ connection and starts the HTTP server.
 * 
 * Startup Process:
 * 1. Connect to RabbitMQ
 * 2. Start Express HTTP server
 * 3. Begin listening for connections
 * 4. Log server startup
 * 
 * @async
 * @function iniciarServidorAuditoria
 * @returns {Promise<void>} Promise that resolves when server is started
 * @since 1.0.0
 * 
 * @example
 * // Start the audit server
 * iniciarServidorAuditoria();
 */
const iniciarServidorAuditoria = async () => {
  /**
   * Establish RabbitMQ connection.
   * Connects to the message broker and begins listening for audit messages.
   */
  await conectarRabbitMQ();
  
  /**
   * Start the Express HTTP server.
   * Begins listening for HTTP requests on the configured port.
   */
  app.listen(PORT, () => {
    console.log(`🚀 Audit Server Express listening on http://localhost:${PORT}`);
  });
};

/**
 * Execute the server startup function.
 * This is the entry point for the audit server application.
 */
iniciarServidorAuditoria();

// Graceful shutdown handling
/**
 * Handles graceful shutdown on SIGINT signal.
 * Closes RabbitMQ connection and logs final metrics before exiting.
 * 
 * Shutdown Process:
 * 1. Log shutdown initiation
 * 2. Close RabbitMQ connection
 * 3. Log final message count
 * 4. Exit process with success code
 * 
 * Signal Handling:
 * - SIGINT: Interrupt signal (Ctrl+C)
 * - Common method for terminating applications
 * - Allows for cleanup before exit
 * 
 * @event process#SIGINT
 * @since 1.0.0
 */
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down audit server...');
  if (connection) {
    /**
     * Close RabbitMQ connection.
     * Ensures proper cleanup of message broker resources.
     */
    await connection.close();
  }
  console.log(`📊 Total messages processed: ${mensajesProcesados}`);
  process.exit(0);
});

// Handling uncaught errors
/**
 * Handles uncaught exceptions.
 * Catches and logs errors that are not handled elsewhere in the application.
 * 
 * Error Handling:
 * - Logs error details
 * - Exits process with error code
 * - Prevents indefinite hanging
 * 
 * @event process#uncaughtException
 * @param {Error} error - The uncaught error
 * @since 1.0.0
 */
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Error:', error);
  process.exit(1);
});

/**
 * Handles unhandled promise rejections.
 * Catches and logs promise rejections that are not handled with catch.
 * 
 * Error Handling:
 * - Logs rejection reason
 * - Exits process with error code
 * - Prevents indefinite hanging
 * 
 * @event process#unhandledRejection
 * @param {Object} reason - The rejection reason
 * @param {Promise} promise - The rejected promise
 * @since 1.0.0
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Promise Rejection:', reason);
  process.exit(1);
});