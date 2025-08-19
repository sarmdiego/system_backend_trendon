'use strict';

const CHALK = require('chalk');
const CHALK_CC = new CHALK.Instance({ level: 2 });
const { inspect } = require('util');

/**
 *
 * Tracking-code  :CCM-ZLOG
 * Lang-code      :TL-CCM-ZLOG
 * @type          :Class
 * @version       :1.0.0
 * @description   :Generacion de Logs centralizados.
 * @returns
 *
 */
module.exports = class LogUtilClass {
  /**
   *
   * Tracking-code  :CCM-ZLOG
   * Lang-code      :TL-CCM-ZLOG
   * @type          :Class
   * @version       :1.0.0
   * @description   :Generacion de Logs centralizados.
   * @param {String} _tag - Descripcion del log.
   * @returns
   *
   */
  constructor(_tag = '') {
    this._tag = _tag;
  }

  /**
   *
   * Metodo de estructura del header.
   * @param {String} _type - Tipo de Log
   * @param {String} _tag - Descripcion del log.
   * @returns {String}
   *
   */
  #structuringHeader(_type, _tag) {
    try {
      return `[${_type}] ${new Date().toLocaleString()}:\n|${_tag}|`;
    } catch (_error) {
      console.error('\nCATCH LogUtilClass, #structuringHeader ->', _error, '\n');
    }
  }

  /**
   *
   * Metodo para imprimir los logs de prueba o debug, solo se aplicaran en ambientes de prueba.
   * COLOR GRISS
   * @param {*} _data - Valor a imprimir.
   * @param {Boolean} _compress - mostrar todo el valor en una sola linea (true=si, false=no)
   * @returns
   *
   */
  debug(_data, _compress = true) {
    try {
      if (process.env.NODE_ENV == 'Production') return;
      _compress = _compress == true && typeof _data == 'object' ? true : false;
      _data = _compress == true ? JSON.stringify(_data) : _data;
      console.log(`\n${CHALK_CC.gray(`${this.#structuringHeader('DEBUG', this._tag)}-> ${inspect(_data, { colors: !_compress, depth: null })}`)}\n`);
    } catch (_error) {
      console.error('\nCATCH LogUtilClass, debug ->', _error, '\n');
    }
  }

  /**
   *
   * Metodo para imprimir los datos que se envian a una peticion api.
   * COLOR AZUL CLARO
   * @param {*} _data - Valor a imprimir.)}`)}\n`)
   * @param {Boolean} _compress - mostrar todo el valor en una sola linea (true=si, false=no)
   * @returns
   *
   */
  infoApi(_data, _compress = true) {
    try {
      _compress = _compress == true && typeof _data == 'object' ? true : false;
      _data = _compress == true ? JSON.stringify(_data) : _data;
      console.log(`\n${CHALK_CC.blueBright(`${this.#structuringHeader('INFO_API', this._tag)}-> ${inspect(_data, { colors: !_compress, depth: null })}`)}\n`);
    } catch (_error) {
      console.error('\nCATCH LogUtilClass, infoApi ->', _error, '\n');
    }
  }

  /**
   *
   * Metodo para imprimir la respuesta exitosa de una peticion api.
   * COLOR VERDE CLARO
   * @param {*} _data - Valor a imprimir.
   * @param {Boolean} _compress - mostrar todo el valor en una sola linea (true=si, false=no)
   * @returns
   *
   */
  responseApi(_data, _compress = true) {
    try {
      _compress = _compress == true && typeof _data == 'object' ? true : false;
      _data = _compress == true ? JSON.stringify(_data) : _data;
      console.log(`\n${CHALK_CC.greenBright(`${this.#structuringHeader('RESPONSE_API', this._tag)}-> ${inspect(_data, { colors: !_compress, depth: null })}`)}\n`);
    } catch (_error) {
      console.error('\nCATCH LogUtilClass, responseApi ->', _error, '\n');
    }
  }

  /**
   *
   * Metodo para imprimir la respuesta  errada o error de una peticion api.
   * COLOR ANARANJADO
   * @param {*} _data - Valor a imprimir.
   * @param {Boolean} _compress - mostrar todo el valor en una sola linea (true=si, false=no)
   * @returns
   *
   */
  errorApi(_data, _compress = true) {
    try {
      _compress = _compress == true && typeof _data == 'object' ? true : false;
      _data = _compress == true ? JSON.stringify(_data) : _data;
      console.error(`\n${CHALK_CC.rgb(255, 69, 0)(`${this.#structuringHeader('ERROR_API', this._tag)}-> ${inspect(_data, { colors: !_compress, depth: null })}`)}\n`);
    } catch (_error) {
      console.error('\nCATCH LogUtilClass, errorApi ->', _error, '\n');
    }
  }

  /**
   *
   * Metodo para imprimir la peticiones de errores logicos del cliente.
   * COLOR MORADO CLARO
   * @param {*} _data - Valor a imprimir.
   * @param {Boolean} _compress - mostrar todo el valor en una sola linea (true=si, false=no)
   * @returns
   *
   */
  errorVerify(_data, _compress = true) {
    try {
      _compress = _compress == true && typeof _data == 'object' ? true : false;
      _data = _compress == true ? JSON.stringify(_data) : _data;
      console.error(`\n${CHALK_CC.magentaBright(`${this.#structuringHeader('ERROR_VERIFY', this._tag)}-> ${inspect(_data, { colors: !_compress, depth: null })}`)}\n`);
    } catch (_error) {
      console.error('\nCATCH LogUtilClass, errorVerify ->', _error, '\n');
    }
  }

  /**
   *
   * Metodo para imprimir advertencias en general.
   * COLOR AMARILLO
   * @param {*} _data - Valor a imprimir.
   * @param {} _compress - Valor a imprimir.
   * @returns
   *
   */
  warning(_data, _compress = true) {
    try {
      _compress = _compress == true && typeof _data == 'object' ? true : false;
      _data = _compress == true ? JSON.stringify(_data) : _data;
      console.warn(`\n${CHALK_CC.yellowBright(`${this.#structuringHeader('WARNING', this._tag)}-> ${inspect(_data, { colors: !_compress, depth: null })}`)}\n`);
    } catch (_error) {
      console.error('\nCATCH LogUtilClass, warning ->', _error, '\n');
    }
  }

  /**
   *
   * Metodo para imprimir errores en general.
   * COLOR ROJO
   * @param {*} _data - Valor a imprimir.
   * @param {Boolean} _compress - mostrar todo el valor en una sola linea (true=si, false=no)
   * @returns
   *
   */
  error(_data, _compress = true) {
    try {
      _compress = _compress == true && typeof _data == 'object' ? true : false;
      _data = _compress == true ? JSON.stringify(_data) : _data;
      console.error(`\n${CHALK_CC.red(`${this.#structuringHeader('ERROR', this._tag)}-> ${inspect(_data, { colors: !_compress, depth: null })}`)}\n`);
    } catch (_error) {
      console.error('\nCATCH LogUtilClass, error ->', _error, '\n');
    }
  }

  /**
   *
   * Metodo para imprimir informacion en general.
   * COLOR AZUL
   * @param {*} _data - Valor a imprimir.
   * @param {Boolean} _compress - mostrar todo el valor en una sola linea (true=si, false=no)
   * @returns
   *
   */
  info(_data, _compress = true) {
    try {
      _compress = _compress == true && typeof _data == 'object' ? true : false;
      _data = _compress == true ? JSON.stringify(_data) : _data;
      console.log(`\n${CHALK_CC.blue(`${this.#structuringHeader('INFO', this._tag)}-> ${inspect(_data, { colors: !_compress, depth: null })}`)}\n`);
    } catch (_error) {
      console.error('\nCATCH LogUtilClass, info ->', _error, '\n');
    }
  }

  /**
   *
   * Metodo para imprimir casos exitosos en general.
   * COLOR VERDE
   * @param {*} _data - Valor a imprimir.
   * @param {Boolean} _compress - mostrar todo el valor en una sola linea (true=si, false=no)
   * @returns
   *
   */
  success(_data, _compress = true) {
    try {
      _compress = _compress == true && typeof _data == 'object' ? true : false;
      _data = _compress == true ? JSON.stringify(_data) : _data;
      console.log(`\n${CHALK_CC.green(`${this.#structuringHeader('SUCCESS', this._tag)}-> ${inspect(_data, { colors: !_compress, depth: null })}`)}\n`);
    } catch (_error) {
      console.error('\nCATCH LogUtilClass, success ->', _error, '\n');
    }
  }
};
