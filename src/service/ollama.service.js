import ollama from 'ollama'

const chatOllama = async (prompt) => {
    try {
        const res = await ollama.chat({
            model: 'gemma3:270m',
            messages: [{ role: 'user', content: prompt }],
        })
        return res.message.content
    } catch (error) {
        console.log(error.stack)
    }
}

export default chatOllama