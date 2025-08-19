'use strict';

const ResponseUtilClass = require('../../common/utils/response.util_class');
const ErrorUtilClass = require('../../common/utils/error.util_class');
const { decryptDataService } = require('../services/util.services');

module.exports = () => async (_req, _res, _next) => {
  const CC_RESPONSE = new ResponseUtilClass(_req, _res);
  try {
    //Si no enviaron el deviceId o el nonce retornamos error
    if (!_req.headers?.id || !_req.headers?.nonce) {
      throw new ErrorUtilClass(__filename, 'MCRPTE004', null, '  ').frontend(401);
    }

    // Si no hay body no desencriptamos
    if (_req.body && _req.body?.sbc) {
      const DECRYPTED_BODY = await decryptDataService(_req.body?.sbc, _req.body?.iv, _req.headers?.id, _req.headers?.nonce).catch((_error) => {
        throw new ErrorUtilClass(__filename, 'MCRPTE001').parseCatch(_error);
      });

      try {
        const PARSED_BODY = JSON.parse(DECRYPTED_BODY);
        _req.body = PARSED_BODY;
      } catch {
        throw new ErrorUtilClass(__filename, 'MCRPTE003', null, '  ').frontend(401);
      }
    }

    return _next();
  } catch (_error) {
    return CC_RESPONSE.sendError(!_error.errorType ? new ErrorUtilClass(__filename, 'MCRPTE002', _error).server() : _error);
  }
};
