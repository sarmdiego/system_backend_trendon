'use strict';

const Router = require('express').Router();

const { createNotificationController } = require('../controllers/notification.controller');
// Middleware de autenticación JWT
const jwtMiddleware = require('../middlewares/jwt.middleware');

/**
 *
 * Crear notificación
 * @method POST
 * @type BODY
 * @param {String}  userDeviceToken - Identificación del usuario que recibirá la notificación
 * @param {String}  tipoNotificacion - Tipo de notificación
 * @param {Object}  data - Datos específicos de la notificación
 *
 */
Router.post('/v1/notification/create', createNotificationController);

module.exports = Router;