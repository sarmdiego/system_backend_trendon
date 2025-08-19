'use strict';

const axios = require('axios');
const ErrorUtilClass = require('../../utils/error.util_class');
const EXT_URL_RECAPTHA = 'https://www.google.com/recaptcha/api/siteverify';

module.exports = {
  /**
   *
   * Tracking-code  :CCM-SAGOG
   * Lang-code      :TL-CCM-SAGOG
   * @type          :Service
   * @version       :1.0.0
   * @description   :Verificar si Existe o no el Recaptcha
   * @param {String} _token - Token de Recaptcha enviado desde el Frontend
   * @param {String} _privateKey - Llave privada de token
   *
   */
  async CmmApiVerifyRecapthaService(_token, _privateKey) {
    try {
      if (!_privateKey) throw new ErrorUtilClass(__filename, 'CMM-SAGOGE001', 'Error, parámetro "_privateKey"').server();
      if (!_token) throw new ErrorUtilClass(__filename, 'CMM-SAGOGE002', 'Error, parámetro "_token"').server();

      const SECRET_KEY = _privateKey;
      const API_RESPONSE = await axios({
        method: 'POST',
        url: EXT_URL_RECAPTHA,
        params: { secret: SECRET_KEY, response: _token },
      }).catch((_error) => {
        throw new ErrorUtilClass(__filename, 'CMM-SAGOGE003', _error, 'TL-CCM-SAGOG-1').api();
      });

      // Si no trae nada el response o es invalido
      if (!API_RESPONSE || API_RESPONSE.data.success == false) {
        // Respuesta
        if (API_RESPONSE?.data['error-codes'][0] == 'browser-error') throw new ErrorUtilClass(__filename, 'CMM-SAGOGE005', null, '  ').frontend(401);
        throw new ErrorUtilClass(__filename, 'CMM-SAGOGE004', API_RESPONSE.data, 'TL-CCM-SAGOG-1').api();
      }

      return API_RESPONSE.data;
    } catch (_error) {
      throw !_error.errorType ? new ErrorUtilClass(__filename, 'CMM-SAGOGE006', _error).server() : _error;
    }
  },
};
