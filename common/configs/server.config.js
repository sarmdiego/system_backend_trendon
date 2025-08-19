'use strict';

const Sequelize = require('sequelize');
const Mongoose = require('mongoose');
const i18n = require('i18n');
const path = require('path');
const sessionsModel = require('../../app/models/sessions.model');
const notificationModel = require('../../app/models/notifications.model');
/**
 * Variables de configuración del Servidor.
 * - Conexión a Base de Datos.
 * - Traduccion
 */

module.exports = {
  /**
   * Conexión al motor de Base de Datos Postgresql
   */
  DatabasePg: new Sequelize({
    dialect: 'postgres',
    host: process.env.CC_DB_HOST || 'localhost',
    port: process.env.CC_DB_PORT || 5432,
    database: process.env.CC_DB_NAME || 'no_database',
    username: process.env.CC_DB_USER || 'no_user',
    password: process.env.CC_DB_PASS || 'no_password',
    timezone: process.env.CC_DB_TIME_ZONE,
    logging: process.env.CC_DB_SHOW_LOGS == 'true' ? console.log : false,
    logQueryParameters: true,
    pool: {
      max: parseInt(process.env.CC_DB_POLL_MAX) || 20,
      min: parseInt(process.env.CC_DB_POLL_MIN) || 5,
      idle: parseInt(process.env.CC_DB_POLL_IDLE) || 5000,
    },
  }),

  /**
   * Conexión al motor de Base de Datos.
   */
  Database: new Sequelize({
    dialect: 'postgres',
    host: process.env.CC_DB_HOST || 'localhost',
    port: process.env.CC_DB_PORT || 5432,
    database: process.env.CC_DB_NAME || 'no_database',
    username: process.env.CC_DB_USER || 'no_user',
    password: process.env.CC_DB_PASS || 'no_password',
    timezone: process.env.CC_DB_TIME_ZONE,
    logging: process.env.CC_DB_SHOW_LOGS == 'true' ? console.log : false,
    logQueryParameters: true,
    pool: {
      max: parseInt(process.env.CC_DB_POLL_MAX) || 20,
      min: parseInt(process.env.CC_DB_POLL_MIN) || 5,
      idle: parseInt(process.env.CC_DB_POLL_IDLE) || 5000,
    },
  }),

  /**
   * Conexión al motor de Base de Datos del Backoffice.
   */
  DatabaseBackoffice: new Sequelize(
    process.env.DB_NAME_BACKOFFICE,
    process.env.DB_USER_BACKOFFICE,
    process.env.DB_PASSWORD_BACKOFFICE,
    {
      host: process.env.DB_HOST_BACKOFFICE,
      port: process.env.DB_PORT_BACKOFFICE,
      dialect: 'postgres',
      timezone: process.env.CC_DB_TIME_ZONE,
      logging: process.env.CC_DB_SHOW_LOGS == 'true' ? console.log : false,
      logQueryParameters: true,
      pool: {
        max: parseInt(process.env.CC_DB_POLL_MAX) || 20,
        min: parseInt(process.env.CC_DB_POLL_MIN) || 5,
        idle: parseInt(process.env.CC_DB_POLL_IDLE) || 5000,
      },
    }
  ),

  /**
   * Conexión al motor de Base de Datos MongoDB.
   */
  DatabaseMongo: async () => {
    Mongoose.set('strictQuery', false);
    Mongoose.connect(`mongodb://${process.env.CC_MDB_HOST}`, {
      autoIndex: false,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: process.env.CC_MDB_NAME  || 'no_database',
      authSource: process.env.CC_MDB_AUTH_DB  || 'no_database',
      user: process.env.CC_MDB_USER  || 'no_user',
      pass: process.env.CC_MDB_PASS  || 'no_password',
    }).then(() => {
      console.log('CONECTADO A MONGODB');
      // Verifica los índices
      return notificationModel.listIndexes(); // Cambia 'Session' por tu modelo
    }).then(indexes => {
      console.log('Índices actuales:', indexes);
    }).catch(err => {
      console.error('Error al conectar a MongoDB:', err);
    });
  },

  /**
   * Configuracion de traducciones
   */
  I18nTranslate: (_isGlobal, _locale = 'es', _directory) => {
    let i18nObj = {};
    i18n.configure({
      locales: ['en', 'es'],
      register: _isGlobal ? global : i18nObj,
      directory: _directory,
      defaultLocale: _locale,
    });
    return i18n.init;
  },
};