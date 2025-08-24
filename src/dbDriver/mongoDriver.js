// src/dbDriver/mongoDriver.js
import mongoose from 'mongoose'
import logger from '../logger.js'
import { setTimeout } from 'timers/promises'

// Configuración de conexión con reintentos
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chatbot'
const MAX_RETRIES = process.env.MONGO_MAX_RETRIES || 5
const RETRY_DELAY = process.env.MONGO_RETRY_DELAY || 5000 // milisegundos

let isConnected = false
let retryCount = 0

/**
 * Conecta a la base de datos MongoDB con reintentos
 * @async
 * @function connectToDatabase
 * @returns {Promise<void>} Promesa que se resuelve cuando se establece la conexión
 * @throws {Error} Si no se puede conectar después de los reintentos
 */
const connectToDatabase = async () => {
  if (isConnected) {
    logger.info('Ya conectado a la base de datos MongoDB')
    return
  }

  try {
    logger.info(`Intentando conectar a MongoDB: ${MONGO_URI}`)
    
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout después de 5s en lugar del valor predeterminado de 30s
      socketTimeoutMS: 45000, // Cerrar sockets después de 45 segundos de inactividad
    })

    isConnected = true
    retryCount = 0
    logger.info('Conexión exitosa a MongoDB')
  } catch (error) {
    logger.error('Error conectando a MongoDB:', { error: error.message })
    
    if (retryCount < MAX_RETRIES) {
      retryCount++
      logger.info(`Reintentando conexión en ${RETRY_DELAY}ms... (Intento ${retryCount}/${MAX_RETRIES})`)
      await setTimeout(RETRY_DELAY)
      return connectToDatabase()
    } else {
      logger.error('No se pudo conectar a MongoDB después de múltiples intentos')
      throw new Error('Fallo en la conexión a la base de datos')
    }
  }
}

/**
 * Cierra la conexión a la base de datos
 * @async
 * @function disconnectFromDatabase
 * @returns {Promise<void>} Promesa que se resuelve cuando se cierra la conexión
 */
const disconnectFromDatabase = async () => {
  try {
    await mongoose.connection.close()
    isConnected = false
    logger.info('Desconectado de MongoDB')
  } catch (error) {
    logger.error('Error al desconectar de MongoDB:', { error: error.message })
  }
}

/**
 * Middleware para verificar conexión antes de procesar solicitudes
 * @function databaseConnectionMiddleware
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función middleware siguiente
 * @returns {Promise<void>} Continúa con el siguiente middleware o envía error si falla la conexión
 */
const databaseConnectionMiddleware = async (req, res, next) => {
  if (!isConnected) {
    try {
      await connectToDatabase()
    } catch (error) {
      logger.error('No se puede conectar a la base de datos en middleware:', { error: error.message })
      return res.status(500).json({ error: 'Error de conexión a la base de datos' })
    }
  }
  next()
}

// Event listeners para la conexión de Mongoose
/**
 * Evento cuando se establece la conexión de Mongoose
 */
mongoose.connection.on('connected', () => {
  logger.info('Mongoose conexión establecida')
})

/**
 * Evento cuando se pierde la conexión de Mongoose
 */
mongoose.connection.on('disconnected', () => {
  isConnected = false
  logger.warn('Mongoose conexión perdida')
})

/**
 * Evento cuando ocurre un error en la conexión de Mongoose
 * @param {Error} error - Error de conexión
 */
mongoose.connection.on('error', (error) => {
  logger.error('Error en conexión Mongoose:', { error })
})

// Manejar eventos de cierre de la aplicación
/**
 * Manejador para el evento SIGINT que cierra la conexión a la base de datos
 */
process.on('SIGINT', async () => {
  await disconnectFromDatabase()
  process.exit(0)
})

export {
  connectToDatabase,
  disconnectFromDatabase,
  databaseConnectionMiddleware
}