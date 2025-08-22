import { VERSION } from '../config/env.js'
import logger from '../logger.js'

/**
 * Swagger definition configuration object.
 * Defines the basic information about the API that will be displayed in the Swagger UI.
 * @type {Object}
 */
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Chat Bot API',
    version: VERSION || '1.0.0',
    description: 'API for interacting with the Chat Bot backend service powered by Ollama',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  components: {
    schemas: {
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
 * @type {Object}
 */
const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.js', './src/controller/*.js'],
}

logger.info('Swagger configuration loaded', { version: VERSION })

export default options