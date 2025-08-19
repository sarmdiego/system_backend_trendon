'use strict';

const Busboy = require('busboy');
const ResponseUtilClass = require('../../common/utils/response.util_class');
const ErrorUtilClass = require('../../common/utils/error.util_class');

/**
 *
 * Tracking-code  :GBDT-MMULP
 * Lang-code      :TL-GBDT-MMULP
 * @type          :Middleware
 * @version       :1.0.1
 * @description   :Gestion y recepcion de Archivos, para evitar guardar el archivo, lo transforma a buffer
 * @returns
 *
 */
module.exports = () => async (_req, _res, _next) => {
  const CC_RESPONSE = new ResponseUtilClass(_req, _res);
  try {
    // Instaciamos la clase Busboy para multipart/form-data
    if (_req.headers['content-type'] != 'application/json') {
      const BUSBOY = Busboy({ headers: _req.headers });

      // Cuando sucede el evento file guardamos su nombre
      BUSBOY.on('file', (_fieldName, _file, _info) => {
        try {
          // Variable donde guardaremos los buffers
          const BUFFERS = [];
          const { filename, encoding, mimeType } = _info;
          // Verificamos que vengan todos los parametros
          if (!_file) throw new ErrorUtilClass(__filename, 'MMULPE001', 'parametro _file vacío para middleware de archivos').server();
          if (!_fieldName) throw new ErrorUtilClass(__filename, 'MMULPE002', 'parametro _fieldName vacío para middleware de archivos').server();
          if (!_info) throw new ErrorUtilClass(__filename, 'MMULPE003', 'parametro _info vacío para middleware de archivos').server();

          // Guardamos la información del archivo en formato buffer
          _file
            .on('data', (_data) => {
              try {
                if (!_data) throw new ErrorUtilClass(__filename, 'MMULPE005', 'parametro _data vacío para middleware de archivos').server();

                _req.body[_fieldName.toString()] = {
                  originalname: filename,
                  fieldname: _fieldName,
                  encoding: encoding,
                  mimetype: filename.match(/jpg|jpeg/) ? 'image/jpg' : 'image/png',
                };
                BUFFERS.push(Buffer.from(_data, 'utf-8'));
              } catch (_error) {
                // Emitimos el error
                BUSBOY.emit('error', _error);
              }
            })
            .on('close', () => {
              _req.body[_fieldName.toString()] ? (_req.body[_fieldName.toString()].buffer = Buffer.concat(BUFFERS)) : null;
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
          return CC_RESPONSE.sendError(!_error.errorType ? new ErrorUtilClass(__filename, 'MMULPE006', _error).server() : _error);
        } catch (_error) {
          _req.unpipe(BUSBOY);
          BUSBOY.removeAllListeners();
          return _next(_error);
        }
      });

      // Transmitimos la información en streams
      _req.pipe(BUSBOY);
    } else {
      _next();
    }
  } catch (_error) {
    return CC_RESPONSE.sendError(!_error.errorType ? new ErrorUtilClass(__filename, 'MMULPE007', _error).server() : _error);
  }
};
