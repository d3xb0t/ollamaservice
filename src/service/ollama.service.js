import ollama from 'ollama'

/**
 * Sends a chat prompt to the Ollama service and returns the response.
 * @async
 * @param {string} prompt - The user's prompt to send to the Ollama service
 * @returns {Promise<string|undefined>} The response content from Ollama or undefined if an error occurs
 * @throws {Error} If there's an issue communicating with the Ollama service
 */
const chatOllama = async (prompt) => {
    const res = await ollama.chat({
        model: 'gemma3:270m',
        messages: [{ role: 'user', content: prompt }],
    })
    return res.message.content
}

export default chatOllama