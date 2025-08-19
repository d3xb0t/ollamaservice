import chatOllama from "../service/ollama.service.js"

const chat = async (req, res) => {
    try {
        const response = await chatOllama(req.body.prompt)
        res.status(200).json(response)
    } catch (error) {
        console.log(error.stack)
    }
}

export default chat