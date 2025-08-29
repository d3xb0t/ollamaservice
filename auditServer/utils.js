export const connectAuditoria = async () => {
  try {
    const conn = await amqp.connect('amqp://localhost')
    const ch = await conn.createChannel()
    await ch.assertQueue('auditoria')
    console.log('🔍 Servidor de auditoría conectado a RabbitMQ...')
    return ch
  } catch (error) {
    console.error('❌ Error en conexión de auditoría:', error)
    throw error
  }
}