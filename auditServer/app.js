// auditoria/servidor.js
import express from 'express';
import amqp from 'amqplib';

// Servidor Express para health check y métricas
const app = express();
const PORT = 3001;

let connection = null;
let channel = null;
let mensajesProcesados = 0;

// Middleware
app.use(express.json());

// Rutas de health check
app.get('/', (req, res) => {
  res.json({ 
    status: '✅ Servidor de Auditoría activo',
    mensajesProcesados,
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  const status = connection ? 'conectado' : 'desconectado';
  res.json({ 
    service: 'auditoria',
    status,
    mensajesProcesados
  });
});

// Función para conectar a RabbitMQ
const conectarRabbitMQ = async () => {
  try {
    connection = await amqp.connect('amqp://localhost');
    channel = await connection.createChannel();
    await channel.assertQueue('auditoria');
    
    console.log('🔍 Servidor de Auditoría: Conectado a RabbitMQ');
    escucharMensajes();
  } catch (error) {
    console.error('❌ Servidor de Auditoría: Error de conexión:', error);
  }
};

// Función para escuchar mensajes
const escucharMensajes = () => {
  channel.consume('auditoria', (msg) => {
    if (msg !== null) {
      try {
        const mensaje = JSON.parse(msg.content.toString());
        procesarMensaje(mensaje);
        channel.ack(msg);
      } catch (error) {
        console.error('❌ Servidor de Auditoría: Error procesando mensaje:', error);
        channel.nack(msg);
      }
    }
  });
};

// Función para procesar mensajes (función flecha)
const procesarMensaje = (mensaje) => {
  mensajesProcesados++;
  
  console.log('✅ [AUDITORÍA] Acción registrada:', {
    accion: mensaje,
    procesado: new Date().toISOString(),
    mensajeId: mensajesProcesados
  });

  // Aquí podrías guardar en base de datos, enviar email, etc.
  // guardarEnBaseDeDatos(mensaje);
};

// Función de ejemplo para guardar en base de datos
const guardarEnBaseDeDatos = async (mensaje) => {
  // Implementación futura
  console.log('💾 Guardando en base de datos...', mensaje);
};

// Iniciar el servidor de auditoría
const iniciarServidorAuditoria = async () => {
  await conectarRabbitMQ();
  
  app.listen(PORT, () => {
    console.log(`🚀 Servidor de Auditoría Express escuchando en http://localhost:${PORT}`);
  });
};

iniciarServidorAuditoria();

// Manejo de cierre limpio
process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando servidor de auditoría...');
  if (connection) {
    await connection.close();
  }
  console.log(`📊 Total de mensajes procesados: ${mensajesProcesados}`);
  process.exit(0);
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
  process.exit(1);
});