/**
 * Swagger configuration.
 * Defines the Swagger specification and options for API documentation.
 * This module provides the configuration for generating interactive API
 * documentation using the OpenAPI specification and Swagger UI.
 * 
 * Documentation Features:
 * 1. OpenAPI Specification: Complete API definition
 * 2. Interactive UI: Browser-based API testing interface
 * 3. Schema Definitions: Data model documentation
 * 4. Endpoint Documentation: Path and operation descriptions
 * 5. Automatic Generation: JSDoc-based specification generation
 * 
 * Design Pattern: API Documentation Configuration
 * This module implements the API Documentation Configuration pattern,
 * providing a centralized location for API documentation settings
 * with automatic generation from code annotations.
 * 
 * Specification Components:
 * 1. Info: API title, version, description
 * 2. Servers: API server definitions
 * 3. Paths: Endpoint definitions with parameters and responses
 * 4. Components: Reusable schemas, parameters, responses
 * 5. Security: Authentication and authorization schemes
 * 
 * Integration Points:
 * - JSDoc comments in routes and controllers
 * - Express middleware for serving UI
 * - Application configuration for versioning
 * 
 * @file
 * @module config/swagger
 * @author ChatBot Backend Team
 * @since 1.0.0
 * @copyright 2025 ChatBot Project
 * @license MIT
 * @see {@link https://swagger.io/specification/} OpenAPI Specification
 * @see {@link https://github.com/Surnet/swagger-jsdoc} Swagger JSDoc
 * @see {@link https://github.com/swagger-api/swagger-ui} Swagger UI
 */

import { VERSION } from '../config/env.js'
import logger from '../logger.js'

/**
 * Swagger definition configuration object.
 * Defines the basic information about the API that will be displayed in the Swagger UI.
 * This object follows the OpenAPI Specification format for API metadata.
 * 
 * Definition Structure:
 * 1. OpenAPI Version: Specification version (3.0.0)
 * 2. Info Object: API metadata (title, version, description)
 * 3. Servers Array: API server definitions
 * 4. Components Object: Reusable elements (schemas, parameters)
 * 
 * Specification Compliance:
 * - OpenAPI 3.0.0 compliant
 * - Follows JSON Schema standards
 * - Uses standard field names and formats
 * 
 * @type {Object}
 * @constant {Object}
 * @memberof module:config/swagger
 * @since 1.0.0
 * 
 * @example
 * // The definition object structure
 * {
 *   openapi: '3.0.0',
 *   info: { ... },
 *   servers: [ ... ],
 *   components: { ... }
 * }
 */
const swaggerDefinition = {
  /**
   * OpenAPI specification version.
   * Indicates which version of the OpenAPI Specification is being used.
   * This determines available features and syntax.
   * 
   * Version Information:
   * - 3.0.0: OpenAPI 3.0 specification
   * - Latest major version as of 2025
   * - Supports modern API documentation features
   * 
   * Features Available:
   * - Callbacks and webhooks
   * - Links between operations
   * - Reusable components
   * - Multiple server definitions
   */
  openapi: '3.0.0',
  
  /**
   * API information object.
   * Contains metadata about the API including title, version, and description.
   * This information is displayed prominently in the Swagger UI.
   * 
   * Info Object Properties:
   * - title: API name
   * - version: API version
   * - description: API purpose and features
   * 
   * Display in UI:
   * - Page title and header
   * - Version badge
   * - Description section
   */
  info: {
    /**
     * API title.
     * The name of the API that will be displayed in the documentation.
     * Should be concise and descriptive.
     * 
     * Naming Guidelines:
     * - Clear and specific
     * - Reflects API purpose
     * - Consistent with project naming
     */
    title: 'Chat Bot API',
    
    /**
     * API version.
     * The current version of the API, typically matching the application version.
     * Used for version tracking and compatibility information.
     * 
     * Version Format:
     * - Semantic Versioning (MAJOR.MINOR.PATCH)
     * - Derived from environment configuration
     * - Defaults to '1.0.0' if not specified
     * 
     * Usage:
     * - Version tracking
     * - Compatibility information
     * - Release management
     */
    version: VERSION || '1.0.0',
    
    /**
     * API description.
     * A detailed explanation of the API's purpose and functionality.
     * Provides context for API users and developers.
     * 
     * Description Content:
     * - API purpose
     * - Technology stack
     * - Key features
     * - Usage guidelines
     */
    description: 'API for interacting with the Chat Bot backend service powered by Ollama',
  },
  
  /**
   * API server definitions.
   * Lists the available server endpoints for the API.
   * Allows users to select different environments in the Swagger UI.
   * 
   * Server Object Properties:
   * - url: Server URL
   * - description: Environment description
   * 
   * Multiple Servers:
   * - Development
   * - Staging
   * - Production
   * 
   * URL Formats:
   * - Absolute URLs
   * - Relative URLs (resolved against documentation location)
   * - Variables for dynamic URLs
   */
  servers: [
    {
      /**
       * Server URL.
       * The base URL for accessing the API endpoints.
       * Used for "Try it out" functionality in Swagger UI.
       * 
       * URL Components:
       * - Protocol (http/https)
       * - Host
       * - Port (if non-standard)
       * - Base path (if applicable)
       */
      url: 'http://localhost:3000',
      
      /**
       * Server description.
       * A human-readable description of the server environment.
       * Helps users understand the purpose of each server.
       * 
       * Description Content:
       * - Environment name
       * - Purpose
       * - Access restrictions
       * - Data considerations
       */
      description: 'Development server',
    },
  ],
  
  /**
   * Reusable components.
   * Defines schemas, parameters, responses, and other elements
   * that can be referenced throughout the API specification.
   * 
   * Component Types:
   * - schemas: Data models and structures
   * - parameters: Reusable parameters
   * - responses: Standard response structures
   * - examples: Example values
   * - requestBodies: Request body definitions
   * - headers: Header definitions
   * - securitySchemes: Authentication methods
   * 
   * Benefits:
   * - Reduced duplication
   * - Consistent definitions
   * - Easier maintenance
   * - Better organization
   */
  components: {
    /**
     * Schema definitions.
     * Defines the data models used in the API for requests and responses.
     * These schemas are used for validation and documentation purposes.
     * 
     * Schema Benefits:
     * - Data validation
     * - Type checking
     * - Documentation generation
     * - Client SDK generation
     * 
     * Schema Types:
     * - Request bodies
     * - Response bodies
     * - Parameter objects
     * - Error objects
     */
    schemas: {
      /**
       * Prompt schema.
       * Defines the structure for user prompt requests.
       * Used for validating incoming chat requests.
       * 
       * Schema Properties:
       * - prompt: User's text input
       * 
       * Validation Rules:
       * - Required field
       * - String type
       * - Length constraints
       * - Format requirements
       */
      Prompt: {
        type: 'object',
        required: ['prompt'],
        properties: {
          prompt: {
            type: 'string',
            description: 'The user\'s prompt to send to the AI model',
            example: 'Hello, how are you?'
          }
        }
      },
      
      /**
       * Chat response schema.
       * Defines the structure for AI chat responses.
       * Used for documenting outgoing chat responses.
       * 
       * Schema Properties:
       * - model: AI model identifier
       * - createdAt: Response timestamp
       * - message: Response content
       * - done: Completion status
       * - Performance metrics
       */
      ChatResponse: {
        type: 'object',
        properties: {
          model: {
            type: 'string',
            description: 'The AI model used for the response',
            example: 'gemma3:270m'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp when the response was created'
          },
          message: {
            type: 'object',
            properties: {
              role: {
                type: 'string',
                example: 'assistant'
              },
              content: {
                type: 'string',
                description: 'The content of the AI response',
                example: 'I\'m doing well, thank you for asking!'
              }
            }
          },
          done: {
            type: 'boolean',
            description: 'Indicates if the response is complete'
          },
          totalDuration: {
            type: 'number',
            description: 'Total duration of the request in nanoseconds'
          },
          loadDuration: {
            type: 'number',
            description: 'Duration of loading the model in nanoseconds'
          },
          promptEvalCount: {
            type: 'number',
            description: 'Number of tokens evaluated in the prompt'
          }
        }
      },
      
      /**
       * Error response schema.
       * Defines the structure for error responses.
       * Used for documenting various error conditions.
       * 
       * Schema Properties:
       * - error: Error message
       * - message: Detailed error description
       * - details: Validation error details (if applicable)
       */
      ErrorResponse: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error message',
            example: 'Invalid request body'
          },
          message: {
            type: 'string',
            description: 'Detailed error message',
            example: 'The prompt cannot be empty'
          }
        }
      }
    }
  }
}

/**
 * Options for the swagger-jsdoc module.
 * Defines where to look for JSDoc comments that contain API documentation.
 * This configuration controls the automatic generation of the OpenAPI specification.
 * 
 * Options Structure:
 * 1. swaggerDefinition: API metadata and structure
 * 2. apis: File patterns to scan for JSDoc comments
 * 
 * File Scanning:
 * - Routes files for path definitions
 * - Controller files for operation details
 * - JSDoc comments with @swagger tags
 * 
 * Pattern Matching:
 * - Glob patterns for file selection
 * - Multiple directories supported
 * - Relative paths from project root
 * 
 * @type {Object}
 * @constant {Object}
 * @memberof module:config/swagger
 * @since 1.0.0
 */
const options = {
  /**
   * Swagger definition object.
   * References the swaggerDefinition constant that contains
   * the API metadata and structure information.
   * 
   * Object Reference:
   * - Points to locally defined swaggerDefinition
   * - Contains all API specification metadata
   * - Follows OpenAPI specification format
   */
  swaggerDefinition,
  
  /**
   * API file patterns.
   * Specifies which files to scan for JSDoc comments containing
   * API documentation annotations.
   * 
   * Pattern Types:
   * - Routes files: Path and method definitions
   * - Controller files: Detailed operation information
   * 
   * File Selection:
   * - Specific directories
   * - File extension filtering
   * - Relative path patterns
   * 
   * JSDoc Integration:
   * - Looks for @swagger annotations
   * - Parses YAML-like comment blocks
   * - Merges with swaggerDefinition
   */
  apis: ['./src/routes/*.js', './src/controller/*.js'],
}

// Log successful Swagger configuration loading
// Provides confirmation that API documentation is properly configured
// Includes version information for verification
logger.info('Swagger configuration loaded', { version: VERSION })

export default options