# ChatBot Backend Application - Technical Documentation

## Overview

This document provides a comprehensive technical specification of the ChatBot backend application. The application is a Node.js-based service that provides an interface to interact with Ollama-powered AI models, with features including request validation, audit logging, error handling, and traceability.

## System Architecture

The application follows a layered architecture pattern with clear separation of concerns:

1. **Presentation Layer** - Express.js routes and controllers
2. **Business Logic Layer** - Service modules
3. **Data Access Layer** - MongoDB models and drivers
4. **Cross-cutting Concerns** - Middleware for logging, validation, error handling, and traceability

### Key Components

#### 1. Core Application (`src/app.js`)

The main application file initializes the Express.js framework with the following configurations:

- Security middleware (Helmet)
- Cross-Origin Resource Sharing (CORS) configuration
- Request parsing middleware
- API documentation (Swagger)
- Custom middleware for logging, traceability, and database connectivity
- Rate limiting and request validation
- Error handling middleware

#### 2. Server Entry Point (`src/server.js`)

Responsible for:
- Starting the HTTP server
- Establishing database connections
- Graceful shutdown handling
- Logging server status

#### 3. Configuration Management

Configuration is managed through:
- Environment variables (`.env` file)
- Dedicated configuration files for patterns and Swagger documentation

##### Environment Variables
- `PORT`: Server port (default: undefined)
- `NODE_ENV`: Application environment (default: 'development')
- `VERSION`: Application version (default: '1.0.0')
- `MONGODB_URI`: MongoDB connection string (default: 'mongodb://localhost:27017/chatbot')
- `MONGO_MAX_RETRIES`: Database connection retry attempts (default: 5)
- `MONGO_RETRY_DELAY`: Delay between retries in milliseconds (default: 5000)

#### 4. API Endpoints

##### POST `/`
Sends a prompt to the Ollama AI model and returns the response.

**Request Body:**
```json
{
  "prompt": "string"
}
```

**Responses:**
- 200: Successful response from the AI model
- 400: Invalid request due to bad input
- 503: Service unavailable (typically when Ollama is not running)

#### 5. Middleware Components

##### Traceability Middleware (`src/middleware/traceability.js`)
Generates and attaches a unique request ID to each incoming request for complete traceability across the system.

##### Request Logger (`src/middleware/logger.js`)
Logs incoming requests and their responses with detailed information including:
- Request method and URL
- Response status code
- Response time
- User agent
- IP address

##### Database Connection Middleware (`src/dbDriver/mongoDriver.js`)
Ensures database connectivity before processing requests with automatic retry logic.

##### RabbitMQ Middleware (`src/middleware/rabbitMQ.js`)
Establishes connection to RabbitMQ for message queuing functionality.

#### 6. Data Validation

##### Input Validation (`src/validations.js`)
Validates user prompts using Zod schema validation with the following constraints:
- Prompt is required
- Minimum 1 character
- Maximum 4096 characters
- Trims whitespace
- Cannot contain only whitespace

##### Security Patterns (`src/config/patterns.js`)
Filters prompts against forbidden patterns to prevent jailbreak attempts:
- ignore previous/ignore all instructions
- jailbreak/bypass
- system prompt/reveal your instructions
- act as/pretend to be
- unleash/developer mode
- dan (developer mode references)

#### 7. Services

##### Ollama Service (`src/service/ollama.service.js`)
Interfaces with the Ollama API to send prompts and receive responses using the 'qwen3:0.6b' model.

##### Audit Service (`src/service/audit.service.js`)
Records audit information for each transaction in MongoDB.

##### Error Audit Service (`src/service/errorAudit.service.js`)
Records error information for exception tracking and debugging.

#### 8. Data Models

##### Audit Model (`src/models/audit.model.js`)
Stores request/response information for audit purposes with the following fields:
- requestId (indexed)
- timestamp
- method
- url
- headers
- body
- query
- params
- ip
- userAgent
- responseStatus
- responseTime
- userId

##### Error Audit Model (`src/models/errorAudit.model.js`)
Stores error information with the following fields:
- requestId (indexed)
- timestamp
- error details (name, message, stack, statusCode)
- request details (method, url, headers, body, query, params, ip, userAgent)

#### 9. Error Handling

##### Custom Error Classes (`src/errors.js`)
Implements a CustomError class extending the native Error class with status codes and operational error identification.

##### Error Handler Middleware (`src/errors.js`)
Centralized error handling with:
- Error auditing to MongoDB
- Different logging levels for client vs server errors
- Special handling for validation errors (ZodError)
- Connection error handling for Ollama service

#### 10. Logging

##### Winston Logger (`src/logger.js`)
Configured with:
- Daily rotating file transports for errors and combined logs
- Console transport for development
- Custom formatting including timestamps and request IDs
- Error stack trace capture

#### 11. Utilities

##### Async Error Handler (`src/utils.js`)
Higher-order function that wraps async route handlers to properly catch and forward errors to the error handling middleware.

##### Rate Limiter (`src/utils.js`)
Express-rate-limit middleware configured to allow 20 requests per minute per IP address.

## Security Considerations

1. **Input Validation**: All user inputs are validated using Zod schemas
2. **Forbidden Patterns**: Prompts are checked against a list of forbidden patterns to prevent jailbreak attempts
3. **Rate Limiting**: Requests are rate-limited to prevent abuse
4. **Security Headers**: Helmet middleware provides protection against common web vulnerabilities
5. **CORS Configuration**: Cross-Origin Resource Sharing is restricted to localhost:5173

## Database Design

The application uses MongoDB with two main collections:

1. **audits**: Stores audit logs of all requests
2. **erroraudits**: Stores error logs for debugging

Both collections are indexed on requestId for efficient querying.

## Message Queuing

RabbitMQ integration is used for asynchronous processing:
- Queue name: 'auditoria'
- Messages contain request headers for audit purposes

## API Documentation

Swagger UI is available at `/api-docs` with:
- Interactive API testing interface
- Schema definitions for all request/response objects
- Detailed endpoint descriptions

## Deployment Considerations

1. **Dependencies**: 
   - MongoDB (local or remote)
   - RabbitMQ
   - Ollama with 'qwen3:0.6b' model

2. **Environment Configuration**:
   - Proper environment variables must be set
   - Database and message queue connections must be available

3. **Monitoring**:
   - Daily rotating log files for error tracking
   - Audit logs for request tracking
   - Health checks through standard HTTP responses

## Testing

Unit and integration tests are located in the [tests](tests) directory:
- Unit tests for middleware, services, and validation
- Integration tests for chat functionality

## Performance Considerations

1. **Rate Limiting**: Prevents resource exhaustion
2. **Connection Pooling**: MongoDB and RabbitMQ connections are reused
3. **Asynchronous Processing**: Non-blocking I/O operations
4. **Caching**: Database connections are maintained for reuse

## Error Recovery

1. **Database Retry Logic**: Automatic retry with exponential backoff for database connections
2. **Graceful Shutdown**: Proper cleanup of connections on application shutdown
3. **Error Isolation**: Audit failures don't disrupt main application flow