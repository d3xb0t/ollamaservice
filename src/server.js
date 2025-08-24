import app from './app.js'
import { PORT } from './config/env.js'
import logger from './logger.js'
import { connectToDatabase } from './dbDriver/mongoDriver.js'

const startServer = async () => {
  try {
    await connectToDatabase()
    
    const server = app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`, { 
        port: PORT,
        timestamp: new Date().toISOString()
      })
      console.log(`Servidor corriendo en el puerto ${PORT}`)
    })

    process.on('SIGINT', () => {
      logger.info('Shutting down server...')
      server.close(() => {
        logger.info('Server closed')
        process.exit(0)
      })
    })
  } catch (error) {
    logger.error('Failed to start server:', { error: error.message })
    process.exit(1)
  }
}

startServer()