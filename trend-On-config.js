'use strict';
require('dotenv').config(); // Asegúrate de que esta línea esté al principio para cargar las variables

try {
  // Info Del Core
  process.env.CC_IS_CORE = false;
  process.env.CC_IS_SESSION = true;
  // --- CAMBIO AQUÍ: Usar las variables exactas de tu .env ---
  process.env.CC_CORE_NAME = process.env.CC_bridge_CORE_NAME; // 'bridge'
  process.env.CC_CORE_PORT = process.env.CC_bridge_PORT;     // '8100'

  //Mongo Security DB
  process.env.CC_MDB_HOST = process.env.CC_bridge_MDB_HOST;
  // process.env.CC_MDB_PORT = process.env.CC_bridge_MDB_PORT; // Tu .env no tiene CC_bridge_MDB_PORT. MongoDB Atlas no usa un puerto directo en la URI de SRV.
  process.env.CC_MDB_NAME = process.env.CC_bridge_MDB_SECURITY_NAME;
  process.env.CC_MDB_AUTH_DB = process.env.CC_bridge_MDB_AUTH_DB;
  process.env.CC_MDB_USER = process.env.CC_bridge_MDB_USER;
  process.env.CC_MDB_PASS = process.env.CC_bridge_MDB_PASS;
  process.env.CC_MDB_POLL_MAX = process.env.CC_bridge_MDB_POLL_MAX;
  process.env.CC_MDB_POLL_MIN = process.env.CC_bridge_MDB_POLL_MIN;
  process.env.CC_MDB_POLL_IDLE = process.env.CC_bridge_MDB_POLL_IDLE;
  process.env.CC_MDB_REPLICASET_NAME = process.env.CC_bridge_MDB_REPLICASET_NAME;
  process.env.CC_MDB_CONNECTION_TIMEOUT = process.env.CC_MDB_CONNECTION_TIMEOUT || 10000; // Mejor tomarlo de .env si existe, sino, usar 10000

  // Security
  // process.env.CC_APIKEY = process.env.TRENDON_APIKEY; // No se ve TRENDON_APIKEY en tu .env, verifica si la necesitas.
  // Rate limit
  process.env.ACCESS_CONTROL_CHANCE_TIME = process.env.ACCESS_CONTROL_CHANCE; // Tu .env tiene ACCESS_CONTROL_CHANCE=3

  // API QR (verifica si estos están en tu .env con el prefijo correcto)
  // process.env.API_QR = process.env.TRENDON_API_QR
  // process.env.X_API_KEY = process.env.TRENDON_X_API_KEY
  // process.env.X_API_SECRET = process.env.TRENDON_X_API_SECRET

  // API NOTIFICATIONS
  // Asegúrate de que esta variable sea la correcta. Si es CC_bridge_API_PUSH_NOTIFICATIONS, úsala.
  process.env.API_PUSH_NOTIFICATIONS = process.env.CC_bridge_API_PUSH_NOTIFICATIONS;

  // Iniciamos nuestra APP
  const App = require('./app');
  const LogUtilClass = require('./common/utils/log.util_class');
  const { CMM_SERVER } = require('./common/configs');

  // Asegúrate de que CMM_SERVER.DatabaseMongo() esté usando las variables CC_MDB_HOST, CC_MDB_USER, etc.
  CMM_SERVER.DatabaseMongo()
    .then(() => {
      // Los logs ahora deberían mostrar los valores correctos
      new LogUtilClass('Connect MongoDB').info(`Database Connected, User: ${process.env.CC_MDB_USER} and Database: ${process.env.CC_MDB_NAME}`);
      console.log('Ya conecto DB !!!!Iniciando conexion');
      // Conexion con Express JS
      App.listen(process.env.CC_CORE_PORT, () => {
        console.log('proceso corriendo.');
        new LogUtilClass('Conect Express').info(`Servidor Express Runing: ${process.env.CC_CORE_NAME}, Port: ${process.env.CC_CORE_PORT}`);
      }).on('error', (_error) => {
        new LogUtilClass('CATCH Express Connect').error(_error);
      });
    })
    .catch((_error) => {
      new LogUtilClass('CATCH Failed to Connect mongoDB').error(_error);
    });
} catch (_error) {
  console.error('Error trycatch index\n\n', _error);
}
