'use strict';

/**
 * Expresiones regulares
 */
const REGEX = {
  NICKNAME: /^(?=.*[a-z])([a-z0-9._-]+)$/,
  USERNAME: /^(?=.*[a-zñA-ZÑ])(?!.* )(?!.*[\-._]{2})[A-ZÑa-zñ\d][A-ZÑa-zñ\d\-._]{5,39}$/,
  PASSWORD: /^(?!.*(\d|\D)\1{3})(?!.* )(?=.*[A-ZÑ])(?=.*\d)(?=.*[a-zñ])(?=.*[!"#$%&'()*+,-.\/:;<=>?@[\]^_`{|}~])[A-ZÑa-zñ\d!"#$%&'()*+,-.\/:;<=>?@[\]^_`{|}~]{8,20}$/,
  ONLY_NUMBER: /^[0-9]*$/,
  NATURAL_NUMBERS: /^[1-9]+[0-9]*$/,
  REAL_NUMBERS: /(^[0-9]*[1-9]+[0-9]*\.|,[0-9]*$)|(^[0-9]*\.|,[0-9]*[1-9]+[0-9]*$)|(^[0-9]*[1-9]+[0-9]*$)/,
  GLOBAL_PHONE: /^\d{1,4}-\d{3,15}$/,
 
};

/** Tipos de Errores */
const TYPE_ERRORS = {
  FRONTEND: 1,
  RETURN_VALIDATE: 2,
  API: 3,
  DATABASE: 4,
  SERVER: 5,
};

const ROUTES_LOGS = Object.freeze({
  
  OPERATION_GET_NOTIFICATIONS: 23,
  OPERATION_SET_NOTIFICATIONS_READ: 24,
  OPERATION_COUNT_NOTIFICATIONS: 25,
  
});

const ACTIONS_LOGS = Object.freeze({
  INSERTAR: 1,
  EDITAR: 2,
  CONSULTAR: 3,
  ELIMINAR: 4,
  VER_DETALLES: 5
});

module.exports = {
  REGEX,
	TYPE_ERRORS,
	ROUTES_LOGS,
	ACTIONS_LOGS
};

