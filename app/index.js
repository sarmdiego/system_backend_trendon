'use strict';

const Express = require('express');
const UserAgent = require('express-useragent');
const Cors = require('cors');
const path = require('path');
// CMM PACKAGE
const ResponseUtilClass = require('../common/utils/response.util_class');
const MorganMiddleware = require('../common/middlewares/morgan.middleware');
const ErrorUtilClass = require('../common/utils/error.util_class');
const LogUtilClass = require('../common/utils/log.util_class');

// NATIVE IMPORTS
const { CMM_SERVER } = require('../common/configs');
const { version, dependencies } = require('../package.json');
const Routes = require('./routers');
const bodyParser = require('body-parser');
const App = Express();

// Inicializacion de variables y seteamos el idioma por defecto
App.use((_req, _res, _next) => {
  try {
    _req.CC = {};
    _req.WHOIS = 'req';
    _res.WHOIS = 'res';
    const LANG = process.env.BV_TL_LANG ?? 'es';
    // Seteamos
    CMM_SERVER.I18nTranslate(true, LANG, path.join(__dirname + '/../locales'));
    return _next();
  } catch (_error) {
    new LogUtilClass('INICIO,index.js').error(_error, false);
    return _next();
  }
});

App.use(MorganMiddleware);
App.use(Cors());
App.use(bodyParser.text({ type: 'text/xml' }))
App.use(Express.urlencoded({ extended: false }));
App.use(Express.json({ limit: '10mb' }));
App.use(UserAgent.express());

// Validar SERVIDOR ACTIVO
App.get('/', async (_req, _res) => {
  return _res.status(200).send(`Servidor backend Trend-On esta funcionando!. ${process.env.CC_CORE_NAME} (${version})`);
});

//  Obtener informacion del Proyecto
App.get('/info/:id', async (_req, _res, _next) => {
  if (_req.params.id == process.env.CC_APIKEY) return _res.status(200).send({ project: process.env.CC_CORE_NAME, version: version, pkg: dependencies });
  return _next();
});

// Seteamos rutas Rutas
Routes(App);

// Error (GENERAL NO IDENTIFICADO 500)
App.use(async (_err, _req, _res, _next) => {
  const CC_RESPONSE = new ResponseUtilClass(_req, _res);
  try {
    // JSON Mal Formado
    const NEW_ERROR = _err instanceof SyntaxError && _err.status === 400 && 'body' in _err ? new ErrorUtilClass(__filename, 'MSRVE001', _err, 'Error de sintaxis en el cuerpo de la solicitud').server() : new ErrorUtilClass(__filename, 'MSRVE002', _err).server();
    return CC_RESPONSE.sendError(NEW_ERROR);
  } catch (_error) {
    return CC_RESPONSE.sendError(!_error.errorType ? new ErrorUtilClass(__filename, 'MSRVE003', _error).server() : _error);
  }
});

// Capture All 404 errors
App.use(async (_req, _res, _next) => {
  const CC_RESPONSE = new ResponseUtilClass(_req, _res);
  try {
    let NEW_ERROR = null;
    if (_req.originalUrl == '/favicon.ico') {
      NEW_ERROR = new ErrorUtilClass(__filename, 'MNTFE001', null, 'API no encontrada').frontend();
    } else {
      NEW_ERROR = new ErrorUtilClass(__filename, 'MNTFE001', { name: 'error-404', url: _req.headers.host + _req.originalUrl, method: _req.method }, 'API no encontrada').server(404);
    }
    return CC_RESPONSE.sendError(NEW_ERROR);
  } catch (_error) {
    return CC_RESPONSE.sendError(!_error.errorType ? new ErrorUtilClass(__filename, 'MNTFE002', _error).server() : _error);
  }
});

// Exportar module
module.exports = App;
