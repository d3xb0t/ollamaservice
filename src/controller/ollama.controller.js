import chatOllama from "../service/ollama.service.js"

/**
 * Handles chat requests by sending the user's prompt to the Ollama service.
 * @async
 * @param {Object} req - The HTTP request object
 * @param {Object} req.body - The request body
 * @param {string} req.body.prompt - The user's prompt
 * @param {Object} res - The HTTP response object
 * @returns {Promise<void>}
 */
const chat = async (req, res) => {
    try {
        const response = await chatOllama(req.body.prompt)
        res.status(200).json(response)
    } catch (error) {
        console.log(error.stack)
    }
}

export default chat