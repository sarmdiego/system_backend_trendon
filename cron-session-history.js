require('dotenv').config();
const cron = require('node-cron');
const mongoose = require('mongoose');
const sessionsModel = require('./app/models/sessions.model');
const sessions_historyModel = require('./app/models/sessions_history.model');

const BATCH_SIZE = process.env.TRENDON_MDB_BATCH_SIZE ?? 1000; // Definimos un tamaño de lote adecuado
const TIME_CRON_SESSION_HISTORY = process.env.CC_TIME_CRON_SESSION_HISTORY ?? '0 0 * * *'; // Definimos el horario de ejecución del cronómetro

let isJobRunning = false; // Variable de estado para el bloqueo

// Configuración de Mongoose para aumentar el tiempo de espera
mongoose.set('bufferCommands', false);
mongoose.set('bufferTimeoutMS', 30000); // Aumenta el tiempo de espera a 30 segundos

// Verificar la conexión a la base de datos
mongoose.connection.on('connected', () => {
  console.log('[DB] Conectado a la base de datos');
});

mongoose.connection.on('error', (err) => {
  console.error('[DB] Error en la conexión a la base de datos:', err);
});

process.env.CC_MDB_HOST = process.env.TRENDON_MDB_HOST;
process.env.CC_MDB_NAME = process.env.TRENDON_MDB_SECURITY_NAME;
process.env.CC_MDB_AUTH_DB = process.env.TRENDON_MDB_AUTH_DB;
process.env.CC_MDB_USER = process.env.TRENDON_MDB_USER;
process.env.CC_MDB_PASS = process.env.TRENDON_MDB_PASS;

// Función para conectar a la base de datos
async function connectToDatabase() {
  mongoose.set('strictQuery', false);
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(`mongodb://${process.env.CC_MDB_HOST}`, {
      autoIndex: false,
      dbName: process.env.CC_MDB_NAME || 'no_database',
      authSource: process.env.CC_MDB_AUTH_DB || 'no_database',
      user: process.env.CC_MDB_USER || 'no_user',
      pass: process.env.CC_MDB_PASS || 'no_password',
      socketTimeoutMS: 30000, // Ajustar el tiempo de espera del socket
      connectTimeoutMS: 30000, // Ajustar el tiempo de espera de conexión
    });
    console.log('[DB] Conexión exitosa a la base de datos');
  }
}

console.log('[CRON] Iniciando el proceso de transferencia de sesiones...');
console.log('[CRON] process.env.TRENDON_MDB_BATCH_SIZE', process.env.TRENDON_MDB_BATCH_SIZE);
console.log('[CRON] process.env.CC_TIME_CRON_SESSION_HISTORY', process.env.CC_TIME_CRON_SESSION_HISTORY);
	
// Cron job para ejecutar cada medianoche
cron.schedule(TIME_CRON_SESSION_HISTORY, async () => {
  console.log('[CRON] Iniciando el proceso de transferencia de sesiones...');
  console.log('[CRON] process.env.TRENDON_MDB_BATCH_SIZE', process.env.TRENDON_MDB_BATCH_SIZE);
  console.log('[CRON] process.env.CC_TIME_CRON_SESSION_HISTORY', process.env.CC_TIME_CRON_SESSION_HISTORY);

  if (isJobRunning) {
    console.log('[CRON] El trabajo anterior aún está en curso. Esperando a que termine...');
    return;
  }

  isJobRunning = true; // Establecer el bloqueo

  try {
    await connectToDatabase();
    console.log('[CRON] Conexión a la base de datos establecida.');

    let hasMoreSessions = true;
    let skip = 0;
    let totalSessionsTransferred = 0;

    while (hasMoreSessions) {
      // Obtener las sesiones en lotes
      const sessionsToMove = await sessionsModel
        .find({
          is_active: false,
          created_date: { $lte: new Date() } // Filtrar por sesiones anteriores o iguales a la fecha actual
        })
        .limit(BATCH_SIZE)
        .skip(skip)
        .maxTimeMS(600000);

      // Si no hay más sesiones, detenemos el proceso
      if (sessionsToMove.length === 0) {
        hasMoreSessions = false;
        break;
      }

      // Insertar las sesiones en sessionHistory
      try {
        await sessions_historyModel.insertMany(sessionsToMove, { ordered: false });
        console.log(`[CRON] ${sessionsToMove.length} sesiones transferidas a sessionHistory.`);
      } catch (insertError) {
        if (insertError.code === 11000) {
          console.log('[CRON] Error de clave duplicada al insertar en sessionHistory. Continuando con el siguiente lote...');
        } else {
          throw insertError;
        }
      }

      totalSessionsTransferred += sessionsToMove.length;
      skip += BATCH_SIZE; // Aumentamos el contador para la siguiente iteración
    }

    console.log(`[CRON] Proceso completado. Total de sesiones transferidas: ${totalSessionsTransferred}`);

    // Borrar los registros de la tabla `sessions` con `is_active: false` en lotes
    let totalDeleted = 0;
    let hasMoreInactiveSessions = true;
    let deleteSkip = 0;

    while (hasMoreInactiveSessions) {
      const inactiveSessions = await sessionsModel.find({
        is_active: false,
        created_date: { $lte: new Date() } // Filtrar por sesiones anteriores o iguales a la fecha actual
      }).limit(BATCH_SIZE).skip(deleteSkip).maxTimeMS(600000);

      if (inactiveSessions.length === 0) {
        hasMoreInactiveSessions = false;
        break;
      }

      const result = await sessionsModel.deleteMany({ _id: { $in: inactiveSessions.map((session) => session._id) } });
      console.log(`[CRON] Sesiones inactivas eliminadas en este lote: ${result.deletedCount}`);

      totalDeleted += result.deletedCount;
      deleteSkip += BATCH_SIZE;
    }

    console.log(`[CRON] Total de sesiones inactivas eliminadas: ${totalDeleted}`);

    // Cerrar la conexión a la base de datos
    console.log('[DB] Conexión a la base de datos cerrada.');
  } catch (error) {
    console.error('[CRON] Error en el proceso de transferencia o eliminación de sesiones:', error);
    // Cerrar la conexión a la base de datos en caso de error
    console.log('[DB] Conexión a la base de datos cerrada debido a un error.');
  } finally {
    await mongoose.disconnect();
    isJobRunning = false; // Liberar el bloqueo
  }
}, {
  timezone: 'America/Caracas', // Zona horaria de Caracas, Venezuela
});

console.log('[CRON] Configuración del cron job completada.');