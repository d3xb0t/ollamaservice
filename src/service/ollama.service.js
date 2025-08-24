/**
 * Ollama service.
 * Interacts with the Ollama API to send prompts and receive responses.
 * @file
 * @module service/ollama
 */

import ollama from 'ollama'
import logger from '../logger.js'

/**
 * Sends a chat prompt to the Ollama service and returns the response.
 * @async
 * @param {string} prompt - The user's prompt to send to the Ollama service
 * @param {string} requestId - The unique request ID for traceability
 * @returns {Promise<string|undefined>} The response content from Ollama or undefined if an error occurs
 * @throws {Error} If there's an issue communicating with the Ollama service
 */
const chatOllama = async (prompt, requestId) => {
    logger.info('Calling Ollama service', { 
      prompt, 
      model: 'gemma3:270m',
      requestId
    })
    
    const res = await ollama.chat({
        model: 'gemma3:270m',
        messages: [{ role: 'user', content: prompt }],
    })
    
    logger.info('Ollama service response received', { 
        model: res.model, 
        done: res.done,
        responseLength: res.message?.content?.length,
        requestId
    })
    
    return res.message.content
}

export default chatOllama