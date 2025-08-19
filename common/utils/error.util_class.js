'use strict';

const LogUtilClass = require('../../common/utils/log.util_class');
const { CMM_CONST } = require('../configs');

/**
 *
 * Tracking-code  :CCM-ZERR
 * Lang-code      :TL-CCM-ZERR
 * @type          :Class
 * @version       :1.0.0
 * @description   :Clase para manejar los errores en todo el código.
 * @returns
 *
 */
module.exports = class ErrorUtilClass extends Error {
  /** Objeto de Error */
  #objectError = {
    statusCode: 400,
    trackingCode: ``,
    errorType: CMM_CONST.TYPE_ERRORS.SERVER,
    errorLocation: null,
    errorData: null,
    errorMessage: null,
  };
  /**
   *
   * Tracking-code  :CCM-ZERR
   * Lang-code      :TL-CCM-ZERR
   * @type          :Class
   * @version       :1.0.0
   * @description   :Clase para manejar los errores en todo el código.
   * @param {String} _path - Ruta y nombre del archivo. ( usar __filename)
   * @param {String} _trackingCode - Código de seguimiento.
   * @param {Object} _errorData - Objeto con el error.
   * @param {String} _errorMessage - Mensaje de error
   * @returns
   *
   */
  constructor(_path, _trackingCode, _errorData = null, _errorMessage = 'TL-CCM-ZERR-1') {
    super();
    try {
      // Tracking code + Codigo del proyecto
      this.#objectError.errorLocation = _path;
      this.#objectError.trackingCode = this.#objectError.trackingCode + _trackingCode;
      this.#objectError.errorData = _errorData;
      this.#objectError.errorMessage = _errorMessage;
    } catch (_error) {
      new LogUtilClass('CATCH ErrorUtilClass, constructor').error(_error, false);
      return this.#objectError;
    }
  }

  /**
   *
   * Metodo para controlar el tracking cuando ponermos un errorUtilClass y saber por todos los archivos que pasaron (se usa en el catch)
   * @param {ErrorUtilClass} _errorUtilClass - Objeto de error comun
   *
   */
  parseCatch(_errorUtilClass) {
    try {
      // Tracking code + Codigo del proyecto
      this.#objectError.errorData = _errorUtilClass;
      this.#objectError.errorMessage = _errorUtilClass.errorMessage;

      let RESPUESTA = null;
      // Filtramos para saber de donde es
      switch (parseInt(_errorUtilClass.errorType)) {
        case CMM_CONST.TYPE_ERRORS.FRONTEND:
          this.#objectError.errorData = _errorUtilClass.errorData;
          RESPUESTA = this.frontend(_errorUtilClass.statusCode);
          break;
        case CMM_CONST.TYPE_ERRORS.RETURN_VALIDATE:
          RESPUESTA = this.returnValidate(_errorUtilClass.statusCode);
          break;
        case CMM_CONST.TYPE_ERRORS.API:
          RESPUESTA = this.api(_errorUtilClass.statusCode);
          break;
        case CMM_CONST.TYPE_ERRORS.DATABASE:
          RESPUESTA = this.database(_errorUtilClass.statusCode, true);
          break;
        case CMM_CONST.TYPE_ERRORS.SERVER:
          RESPUESTA = this.server(_errorUtilClass.statusCode);
          break;
        default:
          new LogUtilClass('CATCH ErrorUtilClass, constructor two, no tiene un errorTYPE OJO').error(_errorUtilClass, false);
          break;
      }
      return RESPUESTA;
    } catch (_error) {
      new LogUtilClass('CATCH ErrorUtilClass, constructor two').error(_error, false);
      return this.#objectError;
    }
  }

  /**
   *
   * Metodo para los errores de entrada del usuario (frontend)
   * Retornara todo lo enviado a la clase (No usar en data sensible, EJ: errores de servidor o base de datos)
   * @param {Number} _statusCode - Código de respuesta Http.
   * @returns {ErrorUtilClass} - Clase de error
   *
   */
  frontend(_statusCode = 400) {
    try {
      this.#objectError.statusCode = _statusCode;
      this.#objectError.errorType = CMM_CONST.TYPE_ERRORS.FRONTEND;
      return this.#objectError;
    } catch (_error) {
      new LogUtilClass('CATCH ErrorUtilClass, frontend').error(_error, false);
      return null;
    }
  }

  /**
   *
   * Metodo para los errores que retornan los validate.
   * Retornara todo lo enviado a la clase (No usar en data sensible, EJ: errores de servidor o base de datos)
   * @param {Number} _statusCode - Código de respuesta Http.
   * @param {Boolean} _showFirstDataError - Tomar el mensaje del primer error que consiga en el objectError.
   * @returns {ErrorUtilClass} - Clase de error
   *
   */
  returnValidate(_showFirstDataError = true, _statusCode = 400) {
    try {
      // Editar el mensaje por el primer mensaje o error. Siempre y cuando llegue en el formato
      // if (_showFirstDataError === true && this.#objectError.errorData.message) {
      if (_showFirstDataError === true && Object.keys(this.#objectError.errorData).length > 0) {
        const KEY = Object.keys(this.#objectError.errorData);
        this.#objectError.errorMessage = this.#objectError.errorData[KEY[0]].message;
      } else {
        this.#objectError.errorMessage = 'TL-CCM-ZERR-2';
      }
      this.#objectError.statusCode = _statusCode;
      this.#objectError.errorType = CMM_CONST.TYPE_ERRORS.RETURN_VALIDATE;
      return this.#objectError;
    } catch (_error) {
      new LogUtilClass('CATCH ErrorUtilClass, returnValidate').error(_error, false);
      return null;
    }
  }

  /**
   *
   * Metodo para los errores de llamado de apis internas o externas.
   * Todo lo enviado en Error Data se va suprimir y no mostrar al Cliente final
   * @param {Number} _statusCode - Código de respuesta Http.
   * @returns {ErrorUtilClass} - Clase de error
   *
   */
  api(_statusCode = 406) {
    try {
      this.#objectError.statusCode = _statusCode;
      this.#objectError.errorType = CMM_CONST.TYPE_ERRORS.API;
      this.#objectError.errorData = this.#structuringError(this.#objectError.errorData);
      return this.#objectError;
    } catch (_error) {
      new LogUtilClass('CATCH ErrorUtilClass, api').error(_error, false);
      return null;
    }
  }

  /**
   *
   * Metodo para los errores de base de datos.
   * Todo lo enviado en Error Data se va suprimir y no mostrar al Cliente final
   * @param {Number} _statusCode - Código de respuesta Http.
   * @param {Boolean} _isErrorByCatch - Nos indica si el error es llamado por el metodo catchError
   * @returns {ErrorUtilClass} - Clase de error
   *
   */
  database(_statusCode = 409, _isErrorByCatch = false) {
    try {
      this.#objectError.statusCode = _statusCode;
      this.#objectError.errorType = CMM_CONST.TYPE_ERRORS.DATABASE;
      this.#objectError.errorData = !_isErrorByCatch ? this.#structuringError(this.#objectError.errorData) : this.#objectError.errorData;
      return this.#objectError;
    } catch (_error) {
      new LogUtilClass('CATCH ErrorUtilClass, database').error(_error, false);
      return null;
    }
  }

  /**
   *
   * Metodo para los errores Criticos de Base de dato.
   * Todo lo enviado en Error Data se va suprimir y no mostrar al Cliente final
   * @param {Number} _statusCode - Código de respuesta Http.
   * @returns {ErrorUtilClass} - Clase de error
   *
   */
  server(_statusCode = 420) {
    try {
      this.#objectError.statusCode = _statusCode;
      this.#objectError.errorType = CMM_CONST.TYPE_ERRORS.SERVER;
      this.#objectError.errorData = this.#structuringError(this.#objectError.errorData);
      return this.#objectError;
    } catch (_error) {
      new LogUtilClass('CATCH ErrorUtilClass, server').error(_error, false);
      return null;
    }
  }

  /**
   *
   * Metodo para parsear los errores
   * @param {Error} _error
   * @returns
   *
   */
  #structuringError(_error) {
    try {
      // Error No identificado
      if (!_error) return null;

      // Error usado para los 404 unicamente
      if (_error.name === 'error-404') {
        return {
          name: _error.name,
          url: _error.url,
          method: _error.method,
          ip: _error.ip,
        };
      }

      // Error usado unicamente para sequelize
      if (String(_error.name).substring(0, 9).toLowerCase() === 'sequelize') return this.#parseSequelizeError(_error);

      // Si es un error de Axios
      if (_error.isAxiosError === true) {
        return {
          url: _error.config.url,
          data: _error.config.data,
          headers: _error.config.headers ? JSON.stringify(_error.config.headers) : null,
          method: _error.config.method,
          code: _error.code,
          errno: _error.errno,
          response: _error.response && _error.response.data ? _error.response.data : null,
          message: _error.message,
          stackTrace: _error.stack,
        };
      }

      // if (typeof _error === 'string') return _error;
      if (!_error.name) return _error;

      return {
        name: _error.name ? _error.name : null,
        message: _error.message ? _error.message : null,
        stackTrace: _error.stack ? _error.stack : null,
      };
    } catch (_error) {
      new LogUtilClass('CATCH ErrorUtilClass, structuringError').error(_error, false);
      return null;
    }
  }

  /**
   *
   * Metodo para el tratamiento de los errores de tipo Sequelize
   * @param {SequelizeError} _error
   * @returns
   *
   */
  #parseSequelizeError(_error) {
    try {
      if (_error.name == 'SequelizeBaseError') {
        return { name: _error.name, message: _error.message };
      }

      if (_error.name == 'SequelizeEagerLoadingError') {
        return { name: _error.name, message: _error.message };
      }

      if (_error.name == 'SequelizeValidationError') {
        return { name: _error.name, message: _error.message, errors: _error.errors };
      }

      /* Estable */
      if (_error.name === 'SequelizeDatabaseError') {
        return {
          name: _error.name,
          message: _error.message,

          severity: _error.parent.severity,
          schema: _error.parent.schema,
          table: _error.parent.table,
          column: _error.parent.column,
          routine: _error.parent.routine,
          detail: _error.parent.detail,

          sql: {
            query: _error.sql,
            parameters: _error.parameters,
          },
        };
      }

      if (_error.name == 'SequelizeTimeoutError') {
        return { name: _error.name, message: _error.message };
      }

      if (_error.name == 'SequelizeUniqueConstraintError') {
        return {
          name: _error.name,
          message: _error.message,
          detail: _error.parent.detail,
          schema: _error.parent.schema,
          table: _error.parent.table,
          constraint: _error.parent.constraint,
          file: _error.parent.file,
          line: _error.parent.line,
          routine: _error.parent.routine,
          sql: _error.parent.sql,
          parameters: _error.parent.parameters,
        };
      }

      if (_error.name == 'SequelizeForeignKeyConstraintError') {
        return {
          name: _error.name,
          message: _error.message,
          table: _error.table,
          fields: _error.fields,
          value: _error.value,
          index: _error.index,

          sql: {
            query: _error.sql,
            parameters: _error.parameters,
          },
        };
      }

      if (_error.name == 'SequelizeExclusionConstraintError') {
        return {
          name: _error.name,
          message: _error.message,
          constraint: _error.constraint,
          table: _error.table,
          fields: _error.fields,

          sql: {
            query: _error.sql,
            parameters: _error.parameters,
          },
        };
      }

      if (_error.name == 'SequelizeConnectionError') {
        return { name: _error.name, message: _error.parent.message, parent: _error.parent };
      }

      if (_error.name == 'SequelizeConnectionRefusedError') {
        return { name: _error.name, message: _error.parent.message, parent: _error.parent };
      }

      if (_error.name == 'SequelizeAccessDeniedError') {
        return { name: _error.name, message: _error.parent.message, parent: _error.parent };
      }

      if (_error.name == 'SequelizeHostNotFoundError') {
        return { name: _error.name, message: _error.parent.message, parent: _error.parent };
      }

      if (_error.name == 'SequelizeHostNotReachableError') {
        return { name: _error.name, message: _error.parent.message, parent: _error.parent };
      }

      if (_error.name == 'SequelizeInvalidConnectionError') {
        return { name: _error.name, message: _error.parent.message, parent: _error.parent };
      }

      if (_error.name == 'SequelizeConnectionTimedOutError') {
        return { name: _error.name, message: _error.parent.message, parent: _error.parent };
      }

      if (_error.name == 'SequelizeInstanceError') {
        return { name: _error.name, message: _error.message };
      }

      if (_error.name == 'SequelizeInstanceError') {
        return { name: _error.name, message: _error.message };
      }

      if (_error === 'object') {
        return _error;
      }

      return { error: _error };
    } catch (_error) {
      new LogUtilClass('CATCH ErrorUtilClass, #parseSequelizeError').error(_error, false);
      return { name: _error.name, message: _error.message };
    }
  }
};
