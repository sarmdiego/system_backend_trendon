'use strict';
require('dotenv').config();

try {
  // Info Del Core
  process.env.CC_IS_CORE = false;
  process.env.CC_IS_SESSION = true;
  process.env.CC_CORE_NAME = process.env.TRENDON_CORE_NAME;
  process.env.CC_CORE_PORT = process.env.TRENDON_PORT;
  //Mongo Security DB
  process.env.CC_MDB_HOST = process.env.TRENDON_MDB_HOST;
  process.env.CC_MDB_PORT = process.env.TRENDON_MDB_PORT;
  process.env.CC_MDB_NAME = process.env.TRENDON_MDB_SECURITY_NAME;
  process.env.CC_MDB_AUTH_DB = process.env.TRENDON_MDB_AUTH_DB;
  process.env.CC_MDB_USER = process.env.TRENDON_MDB_USER;
  process.env.CC_MDB_PASS = process.env.TRENDON_MDB_PASS;
  process.env.CC_MDB_POLL_MAX = process.env.TRENDON_MDB_POLL_MAX;
  process.env.CC_MDB_POLL_MIN = process.env.TRENDON_MDB_POLL_MIN;
  process.env.CC_MDB_POLL_IDLE = process.env.TRENDON_MDB_POLL_IDLE;
  process.env.CC_MDB_REPLICASET_NAME = process.env.TRENDON_MDB_REPLICASET_NAME;
	process.env.CC_MDB_CONNECTION_TIMEOUT = 10000;
	
  // Security
	process.env.CC_APIKEY = process.env.TRENDON_APIKEY;

	// Rate limit
	process.env.ACCESS_CONTROL_CHANCE_TIME = process.env.CC_ACCESS_CONTROL_CHANCE;

	// API QR
	process.env.API_QR = process.env.TRENDON_API_QR
	process.env.X_API_KEY = process.env.TRENDON_X_API_KEY
	process.env.X_API_SECRET = process.env.TRENDON_X_API_SECRET

	// API NOTIFICATIONS
	process.env.API_PUSH_NOTIFICATIONS = process.env.TRENDON_API_PUSH_NOTIFICATIONS
	
  // Iniciamos nuestra APP
  const App = require('./app');
  const LogUtilClass = require('./common/utils/log.util_class');
  const { CMM_SERVER } = require('./common/configs');


  CMM_SERVER.DatabaseMongo()
    .then(() => {
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
