'use strict';

const morgan = require('morgan');
const chalk = require('chalk');
const CHALK_CC = new chalk.Instance({ level: 2 });

/**
 *
 * Tracking-code  :CCM-MMOR
 * Lang-code      :TL-CCM-MMOR
 * @type          :Middleware
 * @version       :1.0.0
 * @description   :Medir rendimiento del Core
 * @returns
 *
 */
module.exports = morgan((_tokkens, _req, _res) => {
  return [
    CHALK_CC.hex('#14C6A4').bold('>> TRACK REQ'),
    CHALK_CC.hex('#14C6A4').bold('@' + _tokkens.date(_req, _res, 'clf')),
    CHALK_CC.hex('#e6cb00').bold(`[${process.env.CC_CORE_NAME}]`),
    CHALK_CC.hex('#18efff').bold(_tokkens.method(_req, _res)),
    CHALK_CC.hex('#34ace0').bold(_tokkens.url(_req, _res)),
    CHALK_CC.hex('#14C6A4').bold(`(STATUS ${_tokkens.status(_req, _res)})`),
    CHALK_CC.hex('#2ed573').bold(_tokkens['response-time'](_req, _res) + ' ms'),
    '\n',
  ].join(' ');
});

