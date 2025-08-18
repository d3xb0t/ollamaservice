import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { NODE_ENV } from './config/env.js'

const app = express()

// Middleware
app.use(cors())
app.use( NODE_ENV  === 'development' ? morgan('dev') : morgan('tiny') )
app.use(express.json())

// Rutas básicas
app.get('/', (req, res) => {
  res.json({ message: '¡Hola! Bienvenido al servidor Express básico.' })
})

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: '¡Algo salió mal!' })
})

// Middleware para manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' })
})

export default app