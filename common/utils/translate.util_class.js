'use strict';

const i18n = require('i18n');
const ErrorUtilClass = require('./error.util_class');
const LogUtilClass = require('./log.util_class');

/**
 *
 * Tracking-code  :CCM-ZTL
 * Lang-code      :TL-CCM-ZTL
 * @type          :Class
 * @version       :1.0.0
 * @description   :Mapeo y estandarizacion de todas las respuestas http.
 * @param {String} _data - Valor a traducir
 * @returns
 *
 */
module.exports = class TranslateUtilClass {
  #data = null;
  /**
   *
   * Tracking-code  :CCM-ZTL
   * Lang-code      :TL-CCM-ZTL
   * @type          :Class
   * @version       :1.0.1
   * @description   :Mapeo y estandarizacion de todas las respuestas http.
   * @param {String} _data - Valor a traducir
   * @returns
   *
   */
  constructor() {
    this.#data = null;
  }

  /**
   *
   * Tracking-code  :CCM-ZTL
   * Lang-code      :TL-CCM-ZTL
   * @type          :Class
   * @version       :1.0.0
   * @description   :Mapeo y estandarizacion de todas las traducciones en el aplicativo
   * @param {String} _data - Valor a traducir
   * @returns
   *
   */
  init(_data) {
    return this.#translate(_data);
  }

  /**
   *
   * Funcion que permite la traduccion, siempre y cuando vengan los TL o TP (traducciones con parametros)
   * Se va separar las traducciones con parametros de la siguiente forma CODIGO_TRADUCIR((:VAriable1::)Variable N.
   * Donde el separador sera ((:
   * @param {*} _data
   * @returns
   */
  #translate(_data) {
    try {
      this.#data = JSON.parse(JSON.stringify(_data));

      if (typeof _data === 'object') {
        // Si la data es vacia lo retornamos
        if (_data === null || Object.keys(_data).length === 0) return _data;

        const DATA_TO_TRANSLATE = Array.isArray(_data) ? _data : Object.assign({}, _data);

        Object.keys(_data).map((_key) => {
          if (typeof DATA_TO_TRANSLATE[_key] === 'string') {
            if (String(DATA_TO_TRANSLATE[_key]).substring(0, 3) == 'TL-') {
              DATA_TO_TRANSLATE[_key] = i18n.__(DATA_TO_TRANSLATE[_key]);
            } else if (String(DATA_TO_TRANSLATE[_key]).substring(0, 3) == 'TP-') {
              // Guardamos los TL que puedan estar en el TP
              const TRANSLATES_TL = [];

              const SPLIT_TRANSLATE = DATA_TO_TRANSLATE[_key].split('((:');
              // Traducimos y guardamos
              SPLIT_TRANSLATE.slice(1)?.forEach((_value) => {
                if (String(_value).substring(0, 3) == 'TL-') {
                  TRANSLATES_TL.push(i18n.__(_value));
                } else {
                  TRANSLATES_TL.push(_value);
                }
              });
              // Juntamos los traducidos para sustituirlos

              const TRANSLATE_FINAL = [SPLIT_TRANSLATE[0], ...TRANSLATES_TL];

              DATA_TO_TRANSLATE[_key] = i18n.__(...TRANSLATE_FINAL);
            }
          } else if (typeof DATA_TO_TRANSLATE[_key] !== 'undefined') {
            DATA_TO_TRANSLATE[_key] = this.#translate(DATA_TO_TRANSLATE[_key]);
          } else if (typeof DATA_TO_TRANSLATE[_key] == 'undefined') {
            DATA_TO_TRANSLATE[_key] = null;
          } else {
          }
        });
        return DATA_TO_TRANSLATE;
      } else if (typeof _data === 'string' && String(_data).substring(0, 3) == 'TL-') {
        return i18n.__(_data);
      } else if (typeof _data === 'string' && String(_data).substring(0, 3) == 'TP-') {
        // Guardamos los TL que puedan estar en el TP
        const TRANSLATES_TL = [];

        const SPLIT_TRANSLATE = _data.split('((:');

        // Traducimos y guardamos
        SPLIT_TRANSLATE.slice(1)?.forEach((_value) => {
          if (String(_value).substring(0, 3) == 'TL-') {
            TRANSLATES_TL.push(i18n.__(_value));
          } else {
            TRANSLATES_TL.push(_value);
          }
        });
        // Juntamos los traducidos para sustituirlos
        const TRANSLATE_FINAL = [SPLIT_TRANSLATE[0], ...TRANSLATES_TL];

        return i18n.__(...TRANSLATE_FINAL);
      } else {
        return _data;
      }
    } catch (_error) {
      const ERROR = new ErrorUtilClass(__filename, 'CMM-UTLE001', _error).server();
      new LogUtilClass('TranslateClass translate').error(ERROR, true);
    }
  }
};
