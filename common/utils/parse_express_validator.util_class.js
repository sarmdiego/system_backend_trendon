'use strict';

const { validationResult } = require('express-validator');
const { CMM_CONST } = require('../configs');
const ErrorUtilClass = require('./error.util_class');
const LogUtilClass = require('./log.util_class');

/**
 *
 * Tracking-code  :CCM-ZPEV
 * Lang-code      :TL-CCM-ZPEV
 * @type          :Class
 * @version       :1.0.0
 * @description   :Transformar la data del validate express a la logica de la empresa.
 * @returns
 *
 */
module.exports = class ParseExpressValidatorUtilClass {
  #request = null;
  // Estructura de los errores
  #dataObject = {
    message: 'TL-CCM-ZPEV-1',
    value: 'Error',
    trackingCode: 'CMM-UPEVE000',
  };
  #returnObject = [];

  /**
   *
   * Tracking-code  :CCM-ZPEV
   * Lang-code      :TL-CCM-ZPEV
   * @type          :Class
   * @version       :1.0.0
   * @description   :Transformar la data del validate express a la logica de la empresa.
   * @returns
   *
   */
  constructor(_req) {
    this.#request = _req;
    return this;
  }

  parseValues() {
    try {
      const ERRORS = validationResult(this.#request).formatWith((_value) => {
        // Si es un error distinto a los de frontend, debemos notificar el error
        if (_value.msg.errorType > CMM_CONST.TYPE_ERRORS.RETURN_VALIDATE) {
          new LogUtilClass('ParseExpressValidatorClass, parseValues').error(_value, false);
        }
        return {
          message: _value.msg.errorMessage,
          value: _value.value,
          trackingCode: _value.msg.trackingCode,
        };
      });
      return ERRORS;
    } catch (_error) {
      const ERROR = new ErrorUtilClass(__filename, 'CMM-UPEVE001', _error).server();
      new LogUtilClass('CATCH ParseExpressValidatorClass, parseValues').error(ERROR);
      this.#dataObject.trackingCode = 'CMM-UPEVE001';
      return this.#dataObject;
    }
  }

  byFormatValidate() {
    try {
      const ERRORS = validationResult(this.#request).formatWith((_value) => {
        // Si es un error distinto a los de frontend, debemos notificar el error
        if (_value.msg.errorType > CMM_CONST.TYPE_ERRORS.RETURN_VALIDATE) {
          new LogUtilClass('ParseExpressValidatorClass, parseValues').error(_value, false);
        }
        return {
          message: _value.msg.errorMessage,
          value: _value.value ?? '',
          trackingCode: _value.msg.trackingCode,
        };
      });
      this.#returnObject = ERRORS.mapped('params');
      return this;
    } catch (_error) {
      const ERROR = new ErrorUtilClass(__filename, 'CMM-UPEVE001', _error).server();
      new LogUtilClass('CATCH ParseExpressValidatorClass, parseValues').error(ERROR);
      this.#dataObject.trackingCode = 'CMM-UPEVE001';
      return this.#dataObject;
    }
  }

  setDataValidate(_param, _message, _value, _trackingCode) {
    try {
      this.#returnObject = {
        [_param]: {
          message: _message,
          value: _value,
          trackingCode: _trackingCode,
        },
      };
      return this;
    } catch (_error) {
      const ERROR = new ErrorUtilClass(__filename, 'CMM-UPEVE001', _error).server();
      new LogUtilClass('CATCH ParseExpressValidatorClass, parseValues').error(ERROR);
      this.#dataObject.trackingCode = 'CMM-UPEVE001';
      return this.#dataObject;
    }
  }

  isEmpty() {
    return Object.keys(this.#returnObject).length > 0 ? false : true;
  }

  values() {
    return this.#returnObject;
  }
};
