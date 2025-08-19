'use strict';

const { CMM_CONST, CMM_SERVER } = require('../../common/configs');
const CMM_SEQUELIZE = CMM_SERVER.DatabasePg;

const crypto = require('crypto');
const bcrypt = require('bcrypt');
const XLSX = require('xlsx');
const ErrorUtilClass = require('../../common/utils/error.util_class');

/**
 *
 * Tracking-code  :CCM-SPRO
 * Lang-code      :TL-CCM-SPRO
 * @type          :Service
 * @version       :1.0.0
 * @description   :Servicios relacionados con funciones utiles o de uso en la plataforma
 *
 */
module.exports = {
  /**
   *
   * Tracking-code  :CCM-SUTL
   * Lang-code      :TL-CCM-SUTL
   * @type          :Service
   * @version       :1.0.0
   * @description   : Servicio para crear la transaccion de PostgreSQL
   * @param {Object} _queryOptions - Objeto con opciones para configurar la transaccion
   * @returns
   *
   */
  async CmmNewTransactionService(_queryOptions = {}) {
    try {
      return await CMM_SEQUELIZE.transaction(_queryOptions).catch((_error) => {
        throw new ErrorUtilClass(__filename, 'CMM-SUTLE001', _error).database();
      });
    } catch (_error) {
      throw !_error.errorType ? new ErrorUtilClass(__filename, 'CMM-SUTLE002', _error).server() : _error;
    }
  },

  /**
   *
   * Tracking-code  :CCM-SUTL
   * Lang-code      :TL-CCM-SUTL
   * @type          :Service
   * @version       :1.0.0
   * @description   :Crear y exportar un archivo de excell
   * @param {*} _data - Objeto de Valores a imprimir
   * @param {*} _nameReport - Nombre del reporte
   * @returns
   *
   */
  async CmmExportExcelService(_data, _nameReport = 'Report') {
    try {
      if (!_data) throw new ErrorUtilClass(__filename, 'CMM-SUTLE003', 'Error, parámetro "_data"').server();

      // Iniciamos el nuevo archivo excell
      const MY_BOOK = XLSX.utils.book_new();

      // Seteamos la propiedades del mismo
      MY_BOOK.Props = {
        Title: _nameReport,
        Subject: 'Test',
        Author: process.env.CC_BUSSINES,
        CreatedDate: new Date(),
      };

      // Creamos el Nombre de la pagina
      MY_BOOK.SheetNames.push(_nameReport);

      // Data a Importar
      MY_BOOK.Sheets[_nameReport] = await XLSX.utils.json_to_sheet(_data);

      return await XLSX.write(MY_BOOK, { bookType: 'xlsx', type: 'buffer', compression: true });
    } catch (_error) {
      throw !_error.errorType ? new ErrorUtilClass(__filename, 'CMM-SUTLE004', _error).server() : _error;
    }
  },

  /**
   *
   * Tracking-code  :CCM-SUTL
   * Lang-code      :TL-CCM-SUTL
   * @type          :Service
   * @version       :1.0.0
   * @description   :Generar número hexadecimal aleatorio
   * @param {Number} _number - Cantidad de bits a crear
   * @returns
   *
   */
  CmmRandomHexadecimalsService: (_number) => {
    try {
      if (!_number) throw new ErrorUtilClass(__filename, 'CMM-SUTLE005', 'Error, parámetro "_number"').server();
      return crypto.randomBytes(parseInt(_number)).toString('hex');
    } catch (_error) {
      throw !_error.errorType ? new ErrorUtilClass(__filename, 'CMM-SUTLE006', _error).server() : _error;
    }
  },

  /**
   *
   * Tracking-code  :CCM-SUTL
   * Lang-code      :TL-CCM-SUTL
   * @type          :Service
   * @version       :1.0.0
   * @description   :Verificación de contraseñas
   * @param {String} _password - Contrasena a consultar
   * @param {String} _dbPassword - Contrasena almacenada
   * @returns {Boolean}
   *
   */
  CmmVerifyPasswordService: (_password, _dbPassword) => {
    try {
      if (!_password) throw new ErrorUtilClass(__filename, 'CMM-SUTLE007', 'Error, parámetro "_password"').server();
      if (!_dbPassword) throw new ErrorUtilClass(__filename, 'CMM-SUTLE008', 'Error, parámetro "_dbPassword"').server();

      return bcrypt.compareSync(_password, _dbPassword);
    } catch (_error) {
      throw !_error.errorType ? new ErrorUtilClass(__filename, 'CMM-SUTLE009', _error).server() : _error;
    }
  },

  /**
   *
   * Tracking-code  :CCM-SUTL
   * Lang-code      :TL-CCM-SUTL
   * @type          :Service
   * @version       :1.0.0
   * @description   :Generar contraseña cifrada
   * @param {String} _password - Contrasena a crear
   * @returns {Boolean}
   *
   */
  CmmCreatePasswordService: (_password) => {
    try {
      if (!_password) throw new ErrorUtilClass(__filename, 'CMM-SUTLE010', 'Error, parámetro "_password"').server();

      return bcrypt.hashSync(_password, 10);
    } catch (_error) {
      throw !_error.errorType ? new ErrorUtilClass(__filename, 'CMM-SUTLE011', _error).server() : _error;
    }
  },

  /**
   *
   * Tracking-code  :CCM-SUTL
   * Lang-code      :TL-CCM-SUTL
   * @type          :Service
   * @version       :1.0.0
   * @description   :Validar si el email tiene el formato correcto
   * @param {String} _email - correo electronico.
   * @returns {Boolean}
   *
   */
  CmmIsValidEmailService: (_email) => {
    try {
      if (!_email) throw new ErrorUtilClass(__filename, 'CMM-SUTLE012', 'Error, parámetro "_email"').server();

      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(_email);
    } catch (_error) {
      throw !_error.errorType ? new ErrorUtilClass(__filename, 'CMM-SUTLE013', _error).server() : _error;
    }
  },

  /**
   *
   * Tracking-code  :CCM-SUTL
   * Lang-code      :TL-CCM-SUTL
   * @type          :Service
   * @version       :1.0.0
   * @description   :Función para validar si una fecha es correcta o no
   * @param {Date} _date - Fecha a validar
   * @returns {Boolean}
   *
   */
  CmmIsValidDateService: (_date) => _date instanceof Date && !isNaN(_date),

  /**
   *
   * Tracking-code  :CCM-SUTL
   * Lang-code      :TL-CCM-SUTL
   * @type          :Service
   * @version       :1.0.0
   * @description   :Función para validar formato de número.
   * El formato correcto consiste en que un monto solo puede llevar punto o coma cuando se trata de separación de decimales.
   * Ejemplo: 100000.00
   * @param {Number} _amounts - Monto
   * @returns {Boolean}
   *
   */
  CmmIsValidAmountService(_amount) {
    try {
      if (!_amount && _amount != 0) throw new ErrorUtilClass(__filename, 'CMM-SUTLE014', 'Error, parámetro "_amount"').server();

      const splittedAmountByDots = String(_amount).match(/\./g);
      const splittedAmountByCommas = String(_amount).match(/,/g);

      /* Monto separado/partido por puntos */
      if (splittedAmountByDots) {
        if (splittedAmountByDots.length > 1) return false;
        if (isNaN(_amount)) return false;
      }

      /* Monto separado/partido por comas */
      if (splittedAmountByCommas) {
        if (splittedAmountByCommas.length > 1) return false;
        _amount = _amount.replace(',', '.');
        if (isNaN(_amount)) return false;
      }

      /* Monto separado/partido por puntos y comas */
      if (splittedAmountByDots && splittedAmountByCommas) {
        if (splittedAmountByCommas.length === 1 && splittedAmountByDots.length === 1) return false;
      }

      /* Monto en 0 o negativo */
      if (Number(_amount) <= 0) return false;

      return Number(_amount);
    } catch (_error) {
      throw !_error.errorType ? new ErrorUtilClass(__filename, 'CMM-SUTLE015', _error).server() : _error;
    }
  },

  /**
   * TODO:MALA SOLUCION... Tienes que agregar sobre la marcha... buscar algo mas automatico
   * Tracking-code  :CCM-SUTL
   * Lang-code      :TL-CCM-SUTL
   * @type          :Service
   * @version       :1.0.0
   * @description   :Validar que los caracteres no sean emoticons
   * @param {String} _string - Cadena de string
   * @returns {Boolean}
   *
   */
  CmmRemoveEmojisService(_string) {
    try {
      return _string
        .replace(
          /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g,
          '',
        )
        .trim();
    } catch (_error) {
      throw !_error.errorType ? new ErrorUtilClass(__filename, 'CMM-SUTLE016', _error).server() : _error;
    }
  },

  /**
   * TODO:Contemplar internacional
   * Tracking-code  :CCM-SUTL
   * Lang-code      :TL-CCM-SUTL
   * @type          :Service
   * @version       :1.0.0
   * @description   :Transformar Montos a Formato del pais
   * @param {Number} _value - Monto
   * @param {Number} _totalDecimal - Cantidad de decimales
   * @returns {Boolean}
   *
   */
  CmmTransformCurrencyService: (_value, _totalDecimal) => {
    try {
      if (!_totalDecimal) _totalDecimal = 2;

      _value = '' + _value;
      const separadorDecimales = ',';
      const separadorMiles = '.';
      let result = '';
      let numeroTemporal = '';
      let ya = 0,
        otro = 0;
      // Solo permite , y numeros los demas los borra
      for (let i = 0; i < _value.length; i++) {
        if (_value.charAt(i).match(/\.|\d/)) {
          if (ya != 1 || (_value.charAt(i) != '.' && otro < _totalDecimal)) {
            if (ya > 0) {
              otro++;
            }
            if (_value.charAt(i) == '.') {
              numeroTemporal += ',';
            } else {
              numeroTemporal += _value.charAt(i);
            }
          }
          if (_value.charAt(i) == '.') {
            ya++;
          }
        }
      }
      const partes = numeroTemporal.split(separadorDecimales);
      const entero = partes[0];
      let cifras = entero.length;
      for (var a = 0; a < entero.length; a++) {
        cifras -= 1;
        result += entero.charAt(a);
        if (cifras % 3 == 0 && cifras != 0) {
          result += separadorMiles;
        }
      }
      if (partes.length > 1) {
        result += separadorDecimales + partes[1];
      }
      return result;
    } catch (_error) {
      throw !_error.errorType ? new ErrorUtilClass(__filename, 'CMM-SUTLE017', _error).server() : _error;
    }
  },

  /**
   * TODO:Contemplar internacional
   * Tracking-code  :CCM-SUTL
   * Lang-code      :TL-CCM-SUTL
   * @type          :Service
   * @version       :1.0.0
   * @description   :Transformar Fecha
   * @param {Date} _value - Fecha
   * @returns {Boolean}
   *
   */
  CmmTransformTimeHourService: (_value) => {
    try {
      if (!_value) throw new ErrorUtilClass(__filename, 'CMM-SUTLE018', 'Error, parámetro "_value"').server();

      const DATE = new Date(_value);
      const MONTH = DATE.getUTCMonth() + 1; //months from 1-12
      const DAY = DATE.getUTCDate();
      const YEAR = DATE.getUTCFullYear();

      return DAY + '/' + MONTH + '/' + YEAR + '  ' + DATE.toLocaleTimeString();
    } catch (_error) {
      throw !_error.errorType ? new ErrorUtilClass(__filename, 'CMM-SUTLE019', _error).server() : _error;
    }
  },

  /**
   *
   * Tracking-code  :CCM-SUTL
   * Lang-code      :TL-CCM-SUTL
   * @type          :Service
   * @version       :1.0.0
   * @description   :Parsear fecha en cualquier formato.
   * @param {Date} _value - Fecha
   * @returns {Boolean}
   *
   */
  CmmParseDateService: (_value) => {
    try {
      let localeDayStart, localeDayEnd, localeNow, onlyDate, utcDayStart, utcDayEnd, utcDayNow;
      // full Date
      const DATE = new Date(_value ? _value : new Date()).toLocaleString('en-US', { timeZone: 'America/Caracas' });
      const DATE_SPLITTED = DATE.split(', ')[0].split('/');

      localeDayStart = new Date(new Date(new Date(DATE).setHours(0, 0, 0, 0)).toString().split('GMT')[0] + 'UTC').toISOString();
      localeDayEnd = new Date(new Date(new Date(DATE).setHours(23, 59, 59, 999)).toString().split('GMT')[0] + 'UTC').toISOString();
      localeNow = new Date(new Date(new Date(DATE)).toString().split('GMT')[0] + 'UTC').toISOString();

      onlyDate = DATE_SPLITTED[2] + '/' + (DATE_SPLITTED[0] < 10 ? '0' + DATE_SPLITTED[0] : DATE_SPLITTED[0]) + '/' + DATE_SPLITTED[1];

      utcDayStart = new Date(new Date(DATE).setHours(0, 0, 0, 0)).toISOString();
      utcDayEnd = new Date(new Date(DATE).setHours(23, 59, 59, 999)).toISOString();
      utcDayNow = new Date(new Date(DATE)).toISOString();

      return {
        localeDayStart,
        localeDayEnd,
        localeNow,
        onlyDate,
        utcDayStart,
        utcDayEnd,
        utcDayNow,
      };
    } catch (_error) {
      throw !_error.errorType ? new ErrorUtilClass(__filename, 'CMM-SUTLE020', _error).server() : _error;
    }
  },

  /**
   * TODO: Pueden usar la misma que la del cliente? Ojo
   * Tracking-code  :CCM-SUTL
   * Lang-code      :TL-CCM-SUTL
   * @type          :Service
   * @version       :1.0.0
   * @description   :Crear contrasena encriptada
   * @param {String} _value - Contrasena
   * @returns {Boolean}
   *
   */
  CmmEncrypterMerchantPasswordService: (_value) => {
    try {
      if (!_value) throw new ErrorUtilClass(__filename, 'CMM-SUTLE021', 'Error, parámetro "_value"').server();
      return crypto.createHash('sha256').update(String(_value)).digest('hex');
    } catch (_error) {
      throw !_error.errorType ? new ErrorUtilClass(__filename, 'CMM-SUTLE022', _error).server() : _error;
    }
  },

  /**
   *
   * Tracking-code  :CCM-SOP
   * Lang-code      :TL-CCM-SOP
   * @type          :Service
   * @version       :1.0.0
   * @description   :Crea el flag de Sequelize para manejar el bengin transaction o la sesion de base de datos.
   * @param {Object} _queryOptions - Opciones de la sesion de Sequelize.
   * @returns
   *
   */
  async CmmEnmaskDataService(_value, _showFirst = 1, _endFirst = 1) {
    try {
      if (!_value) throw new ErrorUtilClass(__filename, 'CCM-SUTL041', 'Error, parámetro "_value"').server();
      return `${_value.substring(0, _showFirst)}${_value.substring(_showFirst, _value.length - _endFirst).replace(/\d/g, '*')}${_value.substring(_value.length - _endFirst)}`;
    } catch (_error) {
      throw !_error.errorType ? new ErrorUtilClass(__filename, 'CCM-SUTL042', _error).server() : _error;
    }
  },

  /**
   * Metodo para Calcular los espacios/caracteres necesarios de un parametro
   * @param {String} _parameter Contenido del parametro
   * @param {Number} _inputLength Longitud del campo del parametro
   * @param {Boolean} _atStart indica si los espacios deben estar al inicio o al final
   * @param {Boolean} _char caracter que se agregara
   * @returns parametro en formato string modificado
   */
  CmmcalculateSpacesForParametersService: (_parameter, _inputLength, _atStart, _char = ' ') => {
    const SPACES_NEEDED = _inputLength - String(_parameter).length;

    if (SPACES_NEEDED < 0) throw new ErrorUtilClass(__filename, 'CCM-SUTL043', { param: _parameter, paramLength: _inputLength, msg: 'La longitud del campo es mayor que su tamaño.' }).server();

    const CHAR_TO_ADD = new Array(SPACES_NEEDED).fill(_char).join('');

    return _atStart ? CHAR_TO_ADD + _parameter : _parameter + CHAR_TO_ADD;
  },

  /**
   * Metodo para Calcular de Binario a Hexadecimal
   * @param {String} _parameter Contenido del parametro
   * @param {Number} _inputLength Longitud del campo del parametro
   * @param {Boolean} _atStart indica si los espacios deben estar al inicio o al final
   * @param {Boolean} _char caracter que se agregara
   * @returns parametro en formato string modificado
   */
  CmmBinaryToHexService: (_binaryString) => {
    let i,
      k,
      part,
      accum,
      ret = '';
    for (i = _binaryString.length - 1; i >= 3; i -= 4) {
      // extract out in substrings of 4 and convert to hex
      part = _binaryString.substr(i + 1 - 4, 4);
      accum = 0;
      for (k = 0; k < 4; k += 1) {
        if (part[k] !== '0' && part[k] !== '1') {
          // invalid character
          return { valid: false };
        }
        // compute the length 4 substring
        accum = accum * 2 + parseInt(part[k], 10);
      }
      if (accum >= 10) {
        // 'A' to 'F'
        ret = String.fromCharCode(accum - 10 + 'A'.charCodeAt(0)) + ret;
      } else {
        // '0' to '9'
        ret = String(accum) + ret;
      }
    }
    // remaining characters, i = 0, 1, or 2
    if (i >= 0) {
      accum = 0;
      // convert from front
      for (k = 0; k <= i; k += 1) {
        if (_binaryString[k] !== '0' && _binaryString[k] !== '1') {
          return { valid: false };
        }
        accum = accum * 2 + parseInt(_binaryString[k], 10);
      }
      // 3 bits, value cannot exceed 2^3 - 1 = 7, just convert
      ret = String(accum) + ret;
    }
    return { valid: true, result: ret };
  },
};


