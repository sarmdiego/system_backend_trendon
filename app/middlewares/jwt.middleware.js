'use strict';

const ResponseUtilClass = require('../../common/utils/response.util_class');
const ErrorUtilClass = require('../../common/utils/error.util_class');
const { verifyAndRefreshTokenService, decryptDataService, structuringRequestBdtService, deactivateTokenSessionService } = require('../services/util.services');
const LogUtilClass = require('../../common/utils/log.util_class');

module.exports =
  (_validateNonce = true, _validateOtp = true) =>
  async (_req, _res, _next) => {
    const CC_RESPONSE = new ResponseUtilClass(_req, _res);
    try {
      //Si no enviaron el deviceId o el nonce retornamos error
      if (!_req.headers?.id || !_req.headers?.nonce) {
        throw new ErrorUtilClass(__filename, 'MCRPTE004', null, '  ').frontend(401);
      }

      //Si no hay body no desencriptamos
      if (_req.body && _req.body?.sbc) {
        const DECRYPTED_BODY = await decryptDataService(_req.body?.sbc, _req.body?.iv, _req.headers?.id, _req.headers?.nonce).catch((_error) => {
          throw new ErrorUtilClass(__filename, 'MTKNE004').parseCatch(_error);
        });
        try {
          const PARSED_BODY = JSON.parse(DECRYPTED_BODY);
          _req.body = PARSED_BODY;
        } catch {
          throw new ErrorUtilClass(__filename, 'MTKNE005', null, '  ').frontend(401);
        }
      }

      // Obtenemos el token
      let _requestToken = _req?.headers?.authorization && _req?.headers?.authorization?.split(' ')[0] === 'Bearer' ? _req.headers.authorization.split(' ')[1] : null;

      // Validamos que el token no este vacio
      if (!_requestToken) throw new ErrorUtilClass(__filename, 'MTKNE001', null, '  ').frontend(401);

      // Verifico que el token sea valido y retorno el decodifica (Objeto user)
      const NEW_TOKEN = await verifyAndRefreshTokenService(_requestToken, _req, true, _validateNonce).catch((_error) => {
        throw new ErrorUtilClass(__filename, 'MTKNE002').parseCatch(_error);
      });

      _req.CC.MT_DB_USER = { ...NEW_TOKEN.sessionData.metadata, external_token: NEW_TOKEN.tokenResponse };
      _req.CC.refreshToken = _requestToken;

      //Si no ha validado el otp y es necesario, cerramos la sesión
      if (_validateOtp && !_req.CC.MT_DB_USER.isOtpValidated) {
        await structuringRequestBdtService(
          process.env.EXT_BICENTENARIO_ADMIN_API,
          '/api/logoff',
          'POST',
          {
            uid: _req.CC.MT_DB_USER.uid,
            token: _req.CC.MT_DB_USER.external_token,
          },
          process.env.EXT_BICENTENARIO_ADMIN_TOKEN
        ).catch((_error) => {
          new LogUtilClass(`REQ BANCO LOGOUT FALLIDO`).infoApi(BODY, true);
        });

        await deactivateTokenSessionService(_requestToken).catch((_error) => {
          throw new ErrorUtilClass(__filename, 'MTKNE007').parseCatch(_error);
        });

        throw new ErrorUtilClass(__filename, 'MTKNE006', null, '  ').frontend(401);
      }
      return _next();
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new ErrorUtilClass(__filename, 'MTKNE003', _error).server() : _error);
    }
  };
