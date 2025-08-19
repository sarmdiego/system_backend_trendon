'use strict';

const ErrorUtilClass = require('../utils/error.util_class');
const ResponseUtilClass = require('../utils/response.util_class');
const { CmmApiVerifyRecapthaService } = require('../services/api/google_api.service');

/**
 *
 * Tracking-code  :CCM-MREC
 * Lang-code      :TL-CCM-MREC
 * @type          :Middleware
 * @version       :1.0.0
 * @description   :Control y administracion del recaptcha
 * @returns
 *
 */
module.exports =
  (_typeProyect = 'gateway') =>
  async (_req, _res, _next) => {
    const CC_RESPONSE = new ResponseUtilClass(_req, _res, _typeProyect);
    try {
      //Obtenemos el token
      const REQ_RECAPTCHA = _req.headers.recaptcha ? _req.headers.recaptcha : null;

      // No validamos el recaptcha en Desarrollo
      if ((process.env.CC_IS_SERVER_TEST == true || process.env.CC_IS_SERVER_TEST == 'true') && REQ_RECAPTCHA == 'chinchin') return _next();

      // Validamos que el token no este vacio
      if (!REQ_RECAPTCHA) throw new ErrorUtilClass(__filename, 'CMM-MRECE001', null, '  ').server(401);

      // Buscamos el usuario en la base de datos
      const GET_RECAPTHA = await CmmApiVerifyRecapthaService(REQ_RECAPTCHA, process.env.CC_RECAPTCHA).catch((_error) => {
        throw new ErrorUtilClass(__filename, 'CMM-MRECE002').parseCatch(_error);
      });

      // Buscamos Si es un Captha Valido
      if (GET_RECAPTHA && GET_RECAPTHA.success == false) throw new ErrorUtilClass(__filename, 'CMM-MRECE003', null, '  ').server(401);

      return _next();
    } catch (_error) {
      return CC_RESPONSE.gateway().sendError(!_error.errorType ? new ErrorUtilClass(__filename, 'CMM-MRECE004', _error).server() : _error);
    }
  };
