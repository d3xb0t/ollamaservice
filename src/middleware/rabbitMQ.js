import amqp from 'amqplib'

let channel = null
let connection = null

export const initRabbitMQ = async (req, res, next) => { 
    if (channel) {
        req.rabbitChannel = channel
        return next()
    }

    try {
        connection = await amqp.connect('amqp://localhost')
        channel = await connection.createChannel()
        await channel.assertQueue('auditoria')

        console.log('RabbitMQ conectado')
        req.rabbitChannel = channel
        next()
    } catch (error) {
        console.error('Error conectando RabbitMQ', error)
        return res.status(500).json({ error: 'Error conectando RabbitMQ' })
    }
}

