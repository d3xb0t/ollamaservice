import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import router from './routes/ollama.route.js'
import { NODE_ENV } from './config/env.js'
import { errorHandler } from './errors.js'
import { validatePrompt } from './validations.js'
import { rateLimiter } from './utils.js'
import swaggerUi from 'swagger-ui-express'
import swaggerOptions from './config/swagger.js'
import swaggerJsdoc from 'swagger-jsdoc'
import requestLogger from './middleware/logger.js'
import traceabilityMiddleware from './middleware/traceability.js'
import { databaseConnectionMiddleware } from './dbDriver/mongoDriver.js'

const app = express()

const swaggerSpec = swaggerJsdoc(swaggerOptions)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use(traceabilityMiddleware)

app.use(databaseConnectionMiddleware)

app.use(requestLogger)

app.use(cors({
  origin: "http://localhost:5173"
}))

//app.use( NODE_ENV  === 'development' ? morgan('dev') : morgan('tiny') )

app.use(express.json())

app.use('/', rateLimiter, validatePrompt, router)

app.use(errorHandler)

app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' })
})

export default app