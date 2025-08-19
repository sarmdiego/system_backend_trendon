'use strict';

const Axios = require('axios');
const ErrorUtilClass = require('./error.util_class');

/**
 *
 * Tracking-code  :CCM-ZGRQ
 * Lang-code      :TL-CCM-ZGRQ
 * @type          :Class
 * @version       :1.0.0
 * @description   :Usada por el Gateway para manejar los redireccionamientos a los cores.
 * @returns
 *
 */
module.exports = class GatewayRequestUtilClass {
  /**
   *
   * @param {*} _url
   * @param {*} _headers
   */
  constructor(_url, _headers) {
    try {
      const REQUEST = Axios.create({ baseURL: _url, headers: { ..._headers } });
      REQUEST.interceptors.response.use(this.#handleSuccess, this.#handleError);
      this.request = REQUEST;
    } catch (_error) {
      throw !_error.errorType ? new ErrorUtilClass(__filename, 'CMM-ZGRQE001', _error).server() : _error;
    }
  }

  #handleSuccess = (_response) => _response.data;

  #handleError = (_error) => {
    try {
      // Si no conecto
      if (!_error.response) throw new ErrorUtilClass(__filename, 'CMM-ZGRQE002', _error).api();
      // Llenar la data
      const MY_DATA = _error.response ? _error.response.data : _error;
      const TRACKING_CODE = MY_DATA.trackingCode ? MY_DATA.trackingCode : MY_DATA.trackingCode;
      const MESSAGE = MY_DATA.message ? MY_DATA.message : null;
      const DATA = MY_DATA.data ? MY_DATA.data : null;
      const STATUS_CODE = _error.response && _error.response.status ? _error.response.status : 400;
      // Retornamos Error
      throw new ErrorUtilClass(__dirname, TRACKING_CODE, DATA, MESSAGE).frontend(STATUS_CODE);
    } catch (_error) {
      throw !_error.errorType ? new ErrorUtilClass(__filename, 'CMM-ZGRQE003', _error).server() : _error;
    }
  };

  get(_path, _payload) {
    try {
      return this.request.get(_path, { params: _payload });
    } catch (_error) {
      throw !_error.errorType ? new ErrorUtilClass(__filename, 'CMM-ZGRQE004', _error).server() : _error;
    }
  }

  delete(_path, _payload) {
    try {
      return this.request.delete(_path, _payload);
    } catch (_error) {
      throw !_error.errorType ? new ErrorUtilClass(__filename, 'CMM-ZGRQE005', _error).server() : _error;
    }
  }

  post(_path, _payload) {
    try {
      return this.request.request({
        method: 'POST',
        url: _path,
        cache: 'default',
        responseType: 'json',
        data: _payload,
      });
    } catch (_error) {
      throw !_error.errorType ? new ErrorUtilClass(__filename, 'CMM-ZGRQE006', _error).server() : _error;
    }
  }

  put(_path, _payload) {
    try {
      return this.request.request({
        method: 'PUT',
        url: _path,
        headers: this.headers,
        responseType: 'json',
        data: _payload,
      });
    } catch (_error) {
      throw !_error.errorType ? new ErrorUtilClass(__filename, 'CMM-ZGRQE007UGRQE007', _error).server() : _error;
    }
  }
};
