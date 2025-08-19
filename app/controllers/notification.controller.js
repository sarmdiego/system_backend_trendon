'use strict';

const ResponseUtilClass = require('../../common/utils/response.util_class');
const ErrorUtilClass = require('../../common/utils/error.util_class');
const { NotificationTypes } = require('../../common/services/notifications/generateNotificationMessage');
const { saveNotification400 } = require('../../common/services/notifications/saveNotification');

module.exports = {
  /**
   * Crear notificación
   * @param {*} req
   * @param {*} res
   * @returns
   */
  createNotificationController: async (req, res) => {
    const _req = req;
    const _res = res;

    console.log('_req', _req);
    const CC_RESPONSE = new ResponseUtilClass(_req, _res);
    let cedula, tipoNotificacion, mensaje;

    console.log('Content-Type:', _req.get('Content-Type'));
    console.log('_req.is(text/xml)', _req.is('text/xml'));

    if (_req.is('text/xml')) {
      console.log('entro a text:', _req.body);
      // Verificar si el body está vacío
      if (!_req.body || typeof _req.body !== 'string' || _req.body.trim() === '') {
        return CC_RESPONSE.sendError(new ErrorUtilClass(__filename, 'NOTIF001', null, 'Datos insuficientes').frontend());
      }

      // Extraer los datos del bodyText utilizando una expresión regular
      const cedulaMatch = _req.body.match(/"Cedula_r":"([^"]+)"/);
      const tipoNotificacionMatch = _req.body.match(/"Tiponoti":"([^"]+)"/);
      const mensajeMatch = _req.body.match(/"Mensaje":"([^"]+)"/);

      console.log('cedulaMatch:', cedulaMatch);
      console.log('tipoNotificacionMatch:', tipoNotificacionMatch);
      console.log('mensajeMatch:', mensajeMatch);

      if (cedulaMatch && tipoNotificacionMatch && mensajeMatch) {
        cedula = cedulaMatch[1];
        tipoNotificacion = tipoNotificacionMatch[1];
        mensaje = mensajeMatch[1];
      } else {
        return CC_RESPONSE.sendError(new ErrorUtilClass(__filename, 'NOTIF001', null, 'Datos insuficientes').frontend());
      }
    } else if (_req.is('application/json')) {
      // El body está en formato JSON
      ({ cedula, tipoNotificacion, mensaje } = _req.body);
    } else {
      return CC_RESPONSE.sendError(new ErrorUtilClass(__filename, 'NOTIF001', null, 'Tipo de contenido no soportado').frontend());
    }

    // Validar los campos requeridos
    if (!cedula || tipoNotificacion === undefined || !mensaje) {
      return CC_RESPONSE.sendError(new ErrorUtilClass(__filename, 'NOTIF001', null, 'Datos insuficientes').frontend());
    }

    try {
      // Guardar la notificación
      await saveNotification400(cedula, NotificationTypes[tipoNotificacion], mensaje);
      return CC_RESPONSE.send('Notificación guardada', null, 'NOTIF003', null);
    } catch (error) {
      console.error('Error guardando la notificación:', error);
      return CC_RESPONSE.sendError(new ErrorUtilClass(__filename, 'NOTIF004', error).server());
    }
  },
};