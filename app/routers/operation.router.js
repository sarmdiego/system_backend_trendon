'use strict';

const Router = require('express').Router();

// Middlewares
const jwtMiddleware = require('../middlewares/jwt.middleware');

const { ROUTES_LOGS, ACTIONS_LOGS } = require('../configs/constants.config');

const {
  getNotifications,
  setNotificationRead,
  getCountNotifications,
  updateFcmToken
} = require('../controllers/pushNotifications.controller');
const logMiddleware = require('../middlewares/log.middleware');

/**
 *
 * Obtener notificaciones
 * @method post
 * @type N/A
 *
 */
Router.post('/v1/operation/get_notifications', jwtMiddleware(), logMiddleware({ accion: ACTIONS_LOGS.CONSULTAR, modulo: ROUTES_LOGS.OPERATION_GET_NOTIFICATIONS }), getNotifications);

/**
 *
 * Obtener notificaciones
 * @method post
 * @type N/A
 *
 */
Router.post('/v1/operation/set_notifications_read', jwtMiddleware(), logMiddleware({ accion: ACTIONS_LOGS.CONSULTAR, modulo: ROUTES_LOGS.OPERATION_SET_NOTIFICATIONS_READ }), setNotificationRead);

/**
 *
 * Obtener notificaciones
 * @method post
 * @type N/A
 *
 */
Router.post('/v1/operation/count_notications', jwtMiddleware(), /* logMiddleware({ accion: ACTIONS_LOGS.CONSULTAR, modulo: ROUTES_LOGS.OPERATION_COUNT_NOTIFICATIONS }), */ getCountNotifications);

/**
 * Actualizar el FCM token del usuario
 * @method POST
 * @type BODY
 * @param {String}  cedula - Cédula del usuario
 * @param {String}  fcmToken - FCM token del usuario
 */
Router.post('/v1/operation/update_fcm_token', jwtMiddleware(), logMiddleware({ accion: ACTIONS_LOGS.CONSULTAR, modulo: ROUTES_LOGS.OPERATION_UPDATE_FCM_TOKEN }), updateFcmToken);

module.exports = Router;