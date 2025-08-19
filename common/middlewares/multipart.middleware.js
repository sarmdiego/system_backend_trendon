'use strict';

const Busboy = require('busboy');
const ErrorUtilClass = require('../utils/error.util_class');
const ResponseUtilClass = require('../utils/response.util_class');
const ParseExpressValidatorUtilClass = require('../utils/parse_express_validator.util_class')

/**
 *
 * Tracking-code  :CCM-MMULP
 * Lang-code      :TL-CCM-MMULP
 * @type          :Middleware
 * @version       :1.0.1
 * @description   :Gestion y recepcion de Archivos, para evitar guardar el archivo, lo transforma a buffer
 * @returns
 *
 */
module.exports = (_typeProyect = 'gateway') => async (_req, _res, _next) => {
  const CC_RESPONSE = new ResponseUtilClass(_req, _res, _typeProyect);
  try {
    // Verificamos si tiene errores de formato
    const CHECK_ERRORS = new ParseExpressValidatorUtilClass(_req).byFormatValidate();
    if (!CHECK_ERRORS.isEmpty()) throw new ErrorUtilClass(__filename, 'CMM-MMULPE000', CHECK_ERRORS.values()).returnValidate(false);

    // Instaciamos la clase Busboy para multipart/form-data
    const BUSBOY = Busboy({ headers: _req.headers });
    // Variable donde guardaremos los buffers
    const BUFFERS = [];
    // Cuando sucede el evento file guardamos su nombre
    BUSBOY.on('file', (_fieldName, _file, { filename, encoding, mimeType }) => {
      try {
        // Verificamos que vengan todos los parametros
        if (!_file) throw new ErrorUtilClass(__filename, 'CMM-MMULPE001', 'parametro _file vacío para middleware de archivos').server();
        if (!_fieldName) throw new ErrorUtilClass(__filename, 'CMM-MMULPE003', 'parametro _fieldName vacío para middleware de archivos').server();
        if (!encoding) throw new ErrorUtilClass(__filename, 'CMM-MMULPE003', 'parametro _encoding vacío para middleware de archivos').server();
        if (!mimeType) throw new ErrorUtilClass(__filename, 'CMM-MMULPE004', 'parametro _mimetype vacío para middleware de archivos').server();

        // Guardamos la información del archivo en formato buffer
        _file.on('data', (_data) => {
          try {
            if (!_data) throw new ErrorUtilClass(__filename, 'CMM-MMULPE005', 'parametro _data vacío para middleware de archivos').server();
            _req.file = {
              originalname: filename,
              fieldname: _fieldName,
              mimetype: mimeType,
              encoding,
            };
            BUFFERS.push(Buffer.from(_data, 'utf-8'));
          } catch (_error) {
            // Emitimos el error
            BUSBOY.emit('error', _error);
          }
        });
      } catch (_error) {
        // Emitimos el error
        BUSBOY.emit('error', _error);
      }
    });

    // Verficamos si sucede el evento field que contiene la información del par llave/valor
    BUSBOY.on('field', (_fieldName, _fieldValue) => {
      try {
        // Seteamos el par llave/valor que viene del body de la petición
        _req.body[_fieldName.toString()] = _fieldValue.toString();
      } catch (_error) {
        // Emitimos el error
        BUSBOY.emit('error', _error);
      }
    });

    // Cuando termina el proceso de BUSBOY pasamos al siguiente middleware
    BUSBOY.on('finish', () => {
      try {
        _req.unpipe(BUSBOY);
        BUSBOY.removeAllListeners();
        _req.file ? (_req.file.buffer = Buffer.concat(BUFFERS)) : (_req.file = null);
        return _next();
      } catch (_error) {
        // Emitimos el error
        BUSBOY.emit('error', _error);
      }
    });

    // Si existe algún error enviamos la respuesta al cliente de error
    BUSBOY.on('error', (_error) => {
      try {
        // paramos todos los procesos relacionados con BUSBOY
        _req.unpipe(BUSBOY);
        BUSBOY.removeAllListeners();
        return CC_RESPONSE.sendError(!_error.errorType ? new ErrorUtilClass(__filename, 'CMM-MMULPE006', _error).server() : _error);
      } catch (_error) {
        _req.unpipe(BUSBOY);
        BUSBOY.removeAllListeners();
        return _next(_error);
      }
    });

    // Transmitimos la información en streams
    _req.pipe(BUSBOY);
  } catch (_error) {
    return CC_RESPONSE.sendError(!_error.errorType ? new ErrorUtilClass(__filename, 'CMM-MMULPE007', _error).server() : _error);
  }
};
