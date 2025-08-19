'use-strict';

const { encryptDataService } = require('../../app/services/util.services');
const { version } = require('../../package.json');
const { CMM_CONST } = require('../configs');
const ErrorUtilClass = require('../../common/utils/error.util_class');
const LogUtilClass = require('../../common/utils/log.util_class');
const TranslateUtilClass = require('../../common/utils/translate.util_class');

module.exports = class ResponseUtilClass {
  #response = null;
  #request = null;
  #translate = false;
  #agentLog = null;

  /** Variable comun de repuesta */
  #dataResponse = {
    apiVersion: `${process.env.CC_CORE_NAME}-${version || '0.0.0'}`, // Versión
    trackingCode: `${process.env.CC_CORE_NAME || 'DEFINIR'}-`, // Código de seguimiento interno
    data: null, // Respuesta o data del servicio.
    message: 'TL-CCM-ZRES-1', // Mensaje de la respuesta
    maintenance: false, // Modo Mantenimiento
    date: Date.now(), // Hora de la respuesta
  };

  /**
   *
   * Tracking-code  :CCM-ZRES
   * Lang-code      :TL-CCM-ZRES
   * @type          :Class
   * @version       :1.0.0
   * @description   :Mapeo y estandarizacion de todas las respuestas http.
   * @param {HttpReponse} _res - Response de Express.
   * @param {HttpReponse} _req - Request de Express.
   * @param {String} _type - RTipo de proyecto, si es Core o Gateway
   * @returns
   *
   */
  constructor(_req, _res) {
    if (_req.WHOIS != 'req' || _res.WHOIS != 'res') {
      new LogUtilClass(' ResponseUtilClass, constructor').error('Esta mal Seteado el req y res');
      throw new ErrorUtilClass(__filename, 'CMM-ZRESE000').server();
    }

    this.#response = _res; // Objeto response de express
    this.#request = _req; // Objeto request de express
    this.#agentLog = null;
    try {
      this.#agentLog =
        _req || _req != 'undefined'
          ? JSON.stringify({
              url: _req?.headers?.host ? _req.headers.host + _req.originalUrl : null,
              method: _req?.method ? _req.method : null,
              headers: _req?.headers ? _req.headers : null,
              query: _req?.query ? _req.query : null,
              body: _req?.body ? _req.body : null,
              params: _req?.params ? _req.params : null,
              useragent: _req?.useragent ? JSON.stringify(_req.useragent) : null,
            })
          : 'N/A';

      process.env.CC_IS_CORE == 'true' ? this.core() : this.gateway();
    } catch (_error) {
      new LogUtilClass('CATCH esponseUtilClass, constructor').error(_error);
    }
  }

  core(_translate = false) {
    this.#translate = _translate;
    return this;
  }

  gateway(_translate = true, _token = null, _privileges = null) {
    try {
      this.#translate = _translate;
      this.#dataResponse.langVersion = this.#request?.CC?.langVersion ? this.#request.CC.langVersion : null;
      this.#dataResponse.token = this.#request?.CC?.refreshToken ? this.#request.CC.refreshToken : null; // Token
      this.#dataResponse.token = _token === null ? this.#dataResponse.token : _token; // Si el token es enviado desde la clase
      // ONLY BACKOFFICE
      this.#dataResponse.privileges = this.#request?.CC?.privileges ? this.#request.CC.privileges : []; // Privilegios
      this.#dataResponse.privileges = _privileges === null ? this.#dataResponse.privileges : _privileges; // Privilegios
      // ONLY APP
      this.#dataResponse.appVersion = this.#request?.CC?.appVersion ? this.#request.CC.appVersion : null;
      return this;
    } catch (_error) {
      this.#dataResponse.token = null;
      this.#dataResponse.langVersion = null;
      this.#dataResponse.version = null;
      this.#dataResponse.appVersion = null;
      _error = new ErrorUtilClass(__filename, 'CMM-ZRESE001', _error).server();
      new LogUtilClass('CATCH ResponseUtilClass, sendError').error(_error);
      return this.#response.status(_error.statusCode || 450).send(this.#dataResponse);
    }
  }

  addHeader(_headerKey, _headerValue) {
    this.#response.setHeader(_headerKey, _headerValue);
    return this;
  }

  sendFile(_file = null, _statusCode = 200) {
    try {
      return _file ? this.#response.status(_statusCode).end(_file) : this.#response.status(_statusCode).end();
    } catch (_error) {
      _error = new ErrorUtilClass(__filename, 'CMM-ZRESE003', _error).server();
      new LogUtilClass('CATCH ResponseUtilClass, sendFile').error(_error);
      return this.#response.status(_error.statusCode || 450).send(this.#dataResponse);
    }
  }

  async send(_message, _data, _trackingCode, _parsedResponse, _statusCode = 200) {
    try {
      /* Mensaje enviado */
      this.#dataResponse.message = _message;

      /* Código de seguimiento */
      this.#dataResponse.trackingCode = this.#dataResponse.trackingCode + _trackingCode;

      /* Guardar el log si es un error de código */
      this.#dataResponse.data = _parsedResponse !== null && _parsedResponse !== '' ? _parsedResponse : null;

      /* Traducir el objeto */
      if (this.#translate) this.#dataResponse = new TranslateUtilClass().init(this.#dataResponse);

      /* Registramos la respuesta en la sesion */
      if (this.#dataResponse?.token) {
        const SessionsModel = require('../../app/models/sessions.model');

        const DECODE_TOKEN = Buffer.from(String(this.#dataResponse.token), 'base64').toString('utf-8');
        const TOKEN = DECODE_TOKEN?.split('.');

        const UNPARSED_REQUEST = _data ? { body_unparsed: _data } : {};
        /* Actualizamos la sesion */
        await SessionsModel.updateOne(
          { _id: TOKEN[0], is_active: true, refresh_tokens: { $elemMatch: { _id: { $eq: TOKEN[1] } } } },
          {
            $set: {
              'refresh_tokens.0.response': {
                headers: this.#response.req.headers,
                body: _parsedResponse,
                ...UNPARSED_REQUEST,
                route: this.#response.req.route,
                http_status: _statusCode,
                is_error: _statusCode == 200 ? false : true,
              },
            },
          }
        ).catch((_error) => {
          new LogUtilClass('CATCH ResponseUtilClass, send --> SessionsModel').error(_error);
        });
      }

      //Encriptamos la data para responder
      const DATA = Buffer.from(JSON.stringify(this.#dataResponse), 'latin1').toString('base64');

      this.#dataResponse = {
        sbc: DATA,
      };

      /** Respondemos el request http express */
      return this.#response.status(_statusCode).send(this.#dataResponse);
    } catch (_error) {
      _error = new ErrorUtilClass(__filename, 'CMM-ZRESE004', _error).server();
      new LogUtilClass('CATCH ResponseUtilClass, send').error(_error);
      return this.#response.status(_error.statusCode || 450).send(this.#dataResponse);
    }
  }

  /**
   *
   * Metodo para Enviar Rest API errores
   * @param {ErrorUtilClass} _data - Objeto con toda la informacion del error.
   * @return {Object} Retorna el error al cliente
   *
   */
  async sendError(_data) {
    try {
      /* Mensaje */
      this.#dataResponse.message = _data.errorMessage ? _data.errorMessage : this.#dataResponse.message;

      /* Código de seguimiento */
      this.#dataResponse.trackingCode = this.#dataResponse.trackingCode + _data.trackingCode;

      /* Seteamos la data */
      this.#dataResponse.data = _data.errorData !== null && _data.errorData !== '' ? _data.errorData : null;

      /* Hacemos esto para formatear y que sea más legible el rastreo del error, es decir la ruta de donde ocurrió exactamente */
      if (_data.errorData !== null) {
        if (_data.errorData.stackTrace != null || _data.errorData.stackTrace != undefined) {
          _data.errorData.stackTrace = _data.errorData.stackTrace.replace(/\r?\n|\r/, '').replace('   ', '');
        }
      }

      /* Traducir el objeto */
      if (this.#translate) this.#dataResponse = new TranslateUtilClass().init(this.#dataResponse);

      /* Registramos el error en la sesion */
      if (process.env.CC_IS_SESSION && this.#dataResponse.token) {
        const SessionsModel = require('../../app/models/sessions.model');

        const DECODE_TOKEN = Buffer.from(String(this.#dataResponse.token), 'base64').toString('utf-8');
        const TOKEN = DECODE_TOKEN?.split('.');

        /* Actualizamos la sesion */
        await SessionsModel.updateOne(
          { _id: TOKEN[0], is_active: true, refresh_tokens: { $elemMatch: { _id: { $eq: TOKEN[1] } } } },
          {
            $set: {
              'refresh_tokens.0.response': {
                headers: this.#response.req.headers,
                body: this.#dataResponse.data,
                route: this.#response.req.route,
                http_status: _data.statusCode,
                is_error: _data.statusCode == 200 ? false : true,
              },
            },
          }
        ).catch((_error) => {
          new LogUtilClass('CATCH ResponseUtilClass, send --> SessionsModel').error(_error);
        });
      }

      /* Guardamos los logs del error */
      if (_data.errorType === CMM_CONST.TYPE_ERRORS.RETURN_VALIDATE) {
        new LogUtilClass('ResponseUtilClass RETURN_VALIDATE').errorVerify({ error: this.#dataResponse.data }, true);
      } else if (_data.errorType === CMM_CONST.TYPE_ERRORS.FRONTEND) {
        new LogUtilClass('ResponseUtilClass FRONTEND').info({ error: this.#dataResponse }, true);
      } else if (_data.statusCode == 404) {
        /* Mostramos el log con el error */
        new LogUtilClass('ResponseUtilClass, 404').error({ ruta: this.#agentLog, error: this.#dataResponse }, false);

        /* Limpiamos la data para no mostrarla */
        this.#dataResponse.data = null;
      } else {
        /* Mostramos el log con el error */
        new LogUtilClass('ResponseUtilClass, CRITICO').error({ ruta: this.#agentLog, error: this.#dataResponse }, false);

        /* Limpiamos la data para no mostrarla */
        this.#dataResponse.data = null;
      }

      //Encriptamos la data para responder
      const DATA = Buffer.from(JSON.stringify(this.#dataResponse), 'latin1').toString('base64');

      this.#dataResponse = {
        sbc: DATA,
      };

      /** Respondemos el request http express */
      return this.#response.status(_data.statusCode).send(this.#dataResponse);
    } catch (_error) {
      _error = new ErrorUtilClass(__filename, 'CMM-ZRESE005', _error).server();
      new LogUtilClass('CATCH ResponseUtilClass, sendError').error(_error);
      this.#dataResponse.data = null;
      return this.#response.status(_error.statusCode).send(this.#dataResponse);
    }
  }
};
