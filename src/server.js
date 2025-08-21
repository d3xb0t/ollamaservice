import app from './app.js'
import { PORT } from './config/env.js'

/**
 * HTTP server instance.
 * @type {http.Server}
 */
const server = app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`)
})