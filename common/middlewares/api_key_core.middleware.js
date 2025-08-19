'use strict';

const ErrorUtilClass = require('../utils/error.util_class');
const ResponseUtilClass = require('../utils/response.util_class');

/**
 *
 * Tracking-code  :CCM-MKEY
 * Lang-code      :TL-CCM-MKEY
 * @type          :Middleware
 * @version       :1.0.0
 * @description   :Validar que el que hace la peticion tiene acceso al Microservicio o Core.
 * @returns
 *
 */
module.exports = async (_req, _res, _next) => {
  const CC_RESPONSE = new ResponseUtilClass(_req, _res);
  try {
    /** Validamos si queremos verificar el token */
    if (process.env.CC_VALIDATE_APIKEY === 'false') return _next();

    /** Obtenemos el token, de la peticion */
    const API_KEY_REQUEST = _req.headers['api-key'] ? _req.headers['api-key'] : null;

    /** Validamos que el token se ha envido correctamente */
    if (!API_KEY_REQUEST) throw new ErrorUtilClass(__filename, 'CMM-MKEYE001', null, 'Permiso denegado, la petición no tiene el token de seguridad').server(403);

    /** Verificamos si es un token de seguridad valido para este core */
    if (API_KEY_REQUEST !== process.env.CC_APIKEY) throw new ErrorUtilClass(__filename, 'CMM-MKEYE002', null, 'La petición no tiene los permisos suficientes').server(403);

    /** Podemos continuar con la ejecucion */
    return _next();
  } catch (_error) {
    return CC_RESPONSE.sendError(!_error.errorType ? new ErrorUtilClass(__filename, 'CMM-MKEYE003', _error).server(403) : _error);
  }
};
