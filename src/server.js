import app from './app.js'
import { PORT } from './config/env.js'

/**
 * HTTP server instance.
 * @type {http.Server}
 */
const server = app.listen(PORT, () => {
  /**
   * Callback function executed when the server starts listening.
   * Logs a message to the console indicating that the server is running.
   */
  console.log(`Servidor corriendo en el puerto ${PORT}`)
})