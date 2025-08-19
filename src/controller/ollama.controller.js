const chat = (req, res) => {
    const { prompt } = req.body
    res.status(200).json(
        {
            status: 'success',
            prompt
        }
    )
}

export default chat