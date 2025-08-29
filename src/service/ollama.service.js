/**
 * Ollama service.
 * Interacts with the Ollama API to send prompts and receive responses.
 * This module encapsulates all logic related to communicating with the Ollama service,
 * providing a clean abstraction over the external AI model API.
 * 
 * Service Responsibilities:
 * 1. Communicating with the Ollama API
 * 2. Handling API responses and errors
 * 3. Logging service interactions
 * 4. Managing AI model selection
 * 
 * Design Pattern: Service Layer
 * This service follows the Service Layer pattern, encapsulating business logic
 * and providing a clean interface for interacting with external systems.
 * 
 * External Dependencies:
 * - Ollama Node.js client library
 * - AI model (qwen3:0.6b)
 * 
 * Error Handling:
 * - Network errors when connecting to Ollama
 * - API errors from the Ollama service
 * - Timeout errors during long processing
 * 
 * @file
 * @module service/ollama
 * @author ChatBot Backend Team
 * @since 1.0.0
 * @copyright 2025 ChatBot Project
 * @license MIT
 * @see {@link https://www.npmjs.com/package/ollama} Ollama Node.js Client
 * @see {@link https://ollama.ai/} Ollama AI Service
 */

import ollama from 'ollama'
import logger from '../logger.js'

/**
 * Sends a chat prompt to the Ollama service and returns the response.
 * This function is the primary interface for interacting with the AI model,
 * handling the complete request/response cycle with the Ollama service.
 * 
 * Processing Flow:
 * 1. Log the outgoing request
 * 2. Send prompt to Ollama service
 * 3. Wait for response
 * 4. Log the incoming response
 * 5. Return formatted response
 * 
 * AI Model:
 * - Model: qwen3:0.6b
 * - Type: Large Language Model
 * - Capabilities: Text generation, conversation
 * - Provider: Ollama
 * 
 * Request Parameters:
 * - model: Specifies which AI model to use
 * - messages: Array of message objects with role and content
 * 
 * Response Format:
 * - model: The model that generated the response
 * - createdAt: Timestamp of response creation
 * - message: Object containing role and content
 * - done: Boolean indicating if response is complete
 * 
 * Performance Considerations:
 * - Response time depends on model complexity and prompt length
 * - Network latency between application and Ollama service
 * - Model loading time for initial requests
 * 
 * @async
 * @function chatOllama
 * @param {string} prompt - The user's prompt to send to the Ollama service
 * @param {string} requestId - The unique request ID for traceability
 * @returns {Promise<string|undefined>} The response content from Ollama or undefined if an error occurs
 * @throws {Error} If there's an issue communicating with the Ollama service
 * @memberof module:service/ollama
 * @since 1.0.0
 * 
 * @example
 * // Send a prompt to the AI model
 * const response = await chatOllama("Hello, how are you?", "req-123");
 * console.log(response); // "I'm doing well, thank you for asking!"
 */
const chatOllama = async (prompt, requestId) => {
    // Log the outgoing request to the Ollama service
    // This provides visibility into what prompts are being sent to the AI
    // Includes the prompt content and request ID for traceability
    logger.info('Calling Ollama service', { 
      prompt, 
      model: 'qwen3:0.6b',
      requestId
    })
    
    // Send the prompt to the Ollama service and await the response
    // Uses the chat method which is appropriate for conversational interactions
    // The model parameter specifies which AI model to use for processing
    const res = await ollama.chat({
        model: 'qwen3:0.6b',
        messages: [{ role: 'user', content: prompt }],
    })
    
    // Log the response received from the Ollama service
    // This provides visibility into the AI's responses for debugging and monitoring
    // Includes metadata about the response without exposing full content
    logger.info('Ollama service response received', { 
        model: res.model, 
        done: res.done,
        responseLength: res.message?.content?.length,
        requestId
    })
    
    // Return the content of the AI's response
    // This extracts just the text content from the full response object
    // The controller will format this into the final HTTP response
    return res.message.content
}

export default chatOllama