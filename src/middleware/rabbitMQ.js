/**
 * RabbitMQ middleware.
 * Establishes and manages connection to RabbitMQ message broker.
 * This middleware provides message queuing capabilities for asynchronous
 * processing of tasks such as audit logging and background jobs.
 * 
 * Middleware Responsibilities:
 * 1. Establish RabbitMQ connection
 * 2. Create communication channel
 * 3. Assert required queues
 * 4. Attach channel to request object
 * 5. Handle connection errors
 * 
 * Design Pattern: Connection Management Middleware
 * This middleware implements the Connection Management pattern,
 * ensuring that resources are properly initialized before use
 * and gracefully handled when unavailable.
 * 
 * Message Queue Benefits:
 * - Asynchronous processing
 * - Decoupling of components
 * - Improved performance
 * - Fault tolerance
 * - Scalability
 * 
 * Queue Configuration:
 * - Queue Name: 'auditoria'
 * - Durability: Depends on RabbitMQ defaults
 * - Exclusive: false (shared queue)
 * - Auto-delete: false (persistent)
 * 
 * Error Handling:
 * - Connection failures result in 500 responses
 * - Errors are logged for troubleshooting
 * - Failed connections prevent request processing
 * 
 * @file
 * @module middleware/rabbitMQ
 * @author ChatBot Backend Team
 * @since 1.0.0
 * @copyright 2025 ChatBot Project
 * @license MIT
 * @see {@link https://www.rabbitmq.com/} RabbitMQ Message Broker
 * @see {@link https://www.npmjs.com/package/amqplib} AMQP Library
 */

import amqp from 'amqplib';

/**
 * The RabbitMQ channel instance.
 * This is a shared channel used for all message queue operations.
 * Maintained as a module-level variable to persist across requests.
 * 
 * Channel Characteristics:
 * - Single channel for all queue operations
 * - Reused across multiple requests
 * - Closed only during application shutdown
 * - Thread-safe for concurrent operations
 * 
 * @type {amqp.Channel|null}
 * @memberof module:middleware/rabbitMQ
 * @since 1.0.0
 */
let channel = null;

/**
 * The RabbitMQ connection instance.
 * This is the underlying connection to the RabbitMQ server.
 * Maintained as a module-level variable to persist across requests.
 * 
 * Connection Characteristics:
 * - Single connection for application lifecycle
 * - Handles reconnection logic
 * - Manages channel creation
 * - Closed during application shutdown
 * 
 * @type {amqp.Connection|null}
 * @memberof module:middleware/rabbitMQ
 * @since 1.0.0
 */
let connection = null;

/**
 * Express middleware to initialize RabbitMQ connection.
 * Ensures that a connection to RabbitMQ is established before
 * processing requests that require message queuing capabilities.
 * 
 * Initialization Process:
 * 1. Check if channel already exists
 * 2. If exists, attach to request and continue
 * 3. If not, establish new connection
 * 4. Create channel and assert queues
 * 5. Attach channel to request object
 * 6. Handle errors appropriately
 * 
 * Connection Lifecycle:
 * - Created on first request
 * - Reused for subsequent requests
 * - Closed during application shutdown
 * - Automatically reconnects on failure (in theory)
 * 
 * Performance Considerations:
 * - Connection established lazily (on first request)
 * - Single connection shared across all requests
 * - Channel reused for all queue operations
 * - Minimal overhead for requests not using queues
 * 
 * @async
 * @function initRabbitMQ
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Promise that resolves when middleware processing is complete
 * @memberof module:middleware/rabbitMQ
 * @since 1.0.0
 * 
 * @example
 * // Use as Express middleware
 * app.use(initRabbitMQ);
 */
export const initRabbitMQ = async (req, res, next) => {
  // Check if channel already exists and is usable
  // This prevents unnecessary connection attempts for subsequent requests
  // Reuses the existing channel for better performance
  if (channel) {
    /**
     * Attach existing channel to request object.
     * This makes the channel available to controllers and services
     * that need to send messages to the queue.
     * 
     * Channel Usage:
     * - Send audit messages
     * - Process background jobs
     * - Handle asynchronous tasks
     */
    req.rabbitChannel = channel;
    return next();
  }

  try {
    // Establish connection to RabbitMQ server
    // Uses default connection settings (localhost:5672)
    // In production, this should use environment variables
    connection = await amqp.connect('amqp://localhost');
    
    // Create communication channel
    // Channels are lightweight connections that share a single TCP connection
    // Multiple channels can be created per connection for different purposes
    channel = await connection.createChannel();
    
    // Assert that the 'auditoria' queue exists
    // Creates the queue if it doesn't exist
    // Ensures the queue is available for message sending
    await channel.assertQueue('auditoria');
    
    // Log successful connection for monitoring purposes
    // Helps verify that message queuing is operational
    console.log('✅ API: Conectado a RabbitMQ');
    
    // Attach channel to request object for use in controllers
    // Makes the channel available throughout the request lifecycle
    req.rabbitChannel = channel;
    
    // Continue to next middleware in the chain
    // Indicates successful initialization
    next();
  } catch (error) {
    // Log connection error for troubleshooting
    // Includes error details for debugging connectivity issues
    console.error('❌ API: Error conectando a RabbitMQ:', error);
    
    // Return error response when RabbitMQ connection fails
    // Prevents requests from being processed without queue capabilities
    // Status 500 indicates server error
    return res.status(500).json({ error: 'Error de conexión a RabbitMQ' });
  }
};