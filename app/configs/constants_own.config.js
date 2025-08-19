'use strict';

/**
 * Variables Estaticas o Fijas.
 * Tanto de la Base de datos como de las logicas de Programacion.
 * Propias del core
 */

const DOCUMENT_TYPE = {
  V: 1,
  J: 2,
  G: 4,
  E: 6,
  P: 7,
  C: 8,
  R: 9,
};

const DOCUMENT_TYPE_BY_ID = {
  1: 'V',
  2: 'J',
  4: 'G',
  6: 'E',
  7: 'P',
  8: 'C',
  9: 'R',
};
const DOCUMENT_TYPE_BY_PERSON_TYPE = {
  LEGAL_PERSON: ['J', 'G', 'C', 'R'],
  NATURAL_PERSON: ['V', 'E', 'P'],
};

const PAYMENT_SERVICE_OPERATORS = {
  MOVILNET_CANTV: '6617ebfd4f99e81325ad96e7',
  MOVISTAR: '661800a04f99e81325ad96ea',
  DIGITEL: '661800aa4f99e81325ad96ec',
};

const PAYMENT_SERVICE_SERVICES = {
  MOVILNET_RECHARGE: '6617fe784f99e81325ad96e8',
  CANTV_RECHARGE: '661d48856ef2f56b8be4203e',
  MOVISTAR_POSTPAID_RECHARGE: '661d48ec6ef2f56b8be42040',
  MOVISTAR_PREPAID_RECHARGE: '661800b24f99e81325ad96f0',
  DIGITEL_POSTPAID_RECHARGE: '661800b14f99e81325ad96ee',
  DIGITEL_PREPAID_RECHARGE: '661802c54f99e81325ad96f2',
};

const CURRENCIES = {
  EUR: {
    idCurrency: 1,
    ISOName: 'EUR',
    name: 'Euros',
  },
  COP: {
    idCurrency: 2,
    ISOname: 'COP',
    name: 'Pesos Colombianos',
  },
  USD: {
    idCurrency: 4,
    ISOname: 'USD',
    name: 'Dólares',
  },
  VES: {
    idCurrency: 3,
    ISOname: 'VES',
    name: 'Bolívares',
  },
};

const AUTHENTICATION_STEPS = {
  INSERT_DOCUMENT_NUMBER: 1,
  CONFIRM_SAIME_DATA: 2,
  BIOMETRIC_VERIFICATION: 3,
  SIGNUP_FORM_AND_DOCUMENT_IMAGE: 4,
  CREATE_PASSWORD: 5,
  ACCEPT_TERMS_AND_CONDITIONS: 6,
};

const ALLOWED_PRODUCTS_FOR_EXCHANGE = [
  'CNCC',
  
];

const RECAUDACION_SERVICES = {
  SAREN_CONSULTA: '1',
  SAREN_PAGO: '2'
}

const SIMPLETV_SERVICES = {
  SIMPLETV_CONSULTA: '1',
  SIMPLETV_PAGO: '2'
}

module.exports = {
  TOKEN_DURATION: 180000,
  DOCUMENT_TYPE,
  PAYMENT_SERVICE_OPERATORS,
  PAYMENT_SERVICE_SERVICES,
  CURRENCIES,
  AUTHENTICATION_STEPS,
  DOCUMENT_TYPE_BY_PERSON_TYPE,
  ALLOWED_PRODUCTS_FOR_EXCHANGE,
  DOCUMENT_TYPE_BY_ID,
  RECAUDACION_SERVICES,
  SIMPLETV_SERVICES
};
