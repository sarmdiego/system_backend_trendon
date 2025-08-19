const bridgeRequestUtilClass = require('../../common/utils/bridge_request.util_class');
const ResponseUtilClass = require('../../common/utils/response.util_class');
const ParseExpressValidatorUtilClass = require('../../common/utils/parse_express_validator.util_class');
const ErrorUtilClass = require('../../common/utils/error.util_class');
const axios = require('axios');

const { updateTokenService, createTokenSessionService, structuringRequesttrdService, decryptDataService, listPreferencesService, parsetrdNumberService } = require('../services/util.service');
const { assignAnFcmToSecureUser } = require('../services/auth.service');

const API_NOTIFICATIONS = `${process.env.API_PUSH_NOTIFICATIONS}/push/`;
console.log('API_NOTIFICATIONS ',API_NOTIFICATIONS)
/**
 * Manejo de push notifications
 * @param {*} _req
 * @param {*} _res
 * @returns
 */


/**
 * Actualizar el FCM token del usuario
 * @param {*} _req
 * @param {*} _res
 * @returns
 */
const updateFcmToken = async (_req, _res) => {
	const CC_RESPONSE = new ResponseUtilClass(_req, _res);
	const data = JSON.parse(_req.body);
	const { cedula, fcmToken } = data;
	console.log({ cedula, fcmToken })

  try {
    // Validar los campos requeridos
    if (!cedula || !fcmToken) {
      throw new ErrorUtilClass(__filename, 'PUSH001', null, 'Datos insuficientes').frontend();
    }

    // Actualizar el FCM token del usuario
    await assignAnFcmToSecureUser(cedula, fcmToken, null);
		console.log('Al parecer se guardon exito', { cedula, fcmToken })
    // Responder solicitud
    return CC_RESPONSE.send('FCM token actualizado con éxito', null, 'COPES001', null);
	} catch (_error) {
		console.log('Error al actualizar el token', _error)
    return CC_RESPONSE.sendError(!_error.errorType ? new ErrorUtilClass(__filename, 'PUSH002', _error).server() : _error);
  }
};

const getNotifications = async (_req, _res) => {
    const CC_RESPONSE = new ResponseUtilClass(_req, _res);
    const data = JSON.parse(_req.body);
    let {cedula} = data;
    console.log('cedula... ', cedula);
    // const BODY = {
    //     cedula: cedula,
    // }
    
    const notifications = await getAllNotificationsApi(cedula);
    
    try {
    
        const RESPONSE_PARSED = {
            responseCode: 'BCV00OK',
            notifications: notifications
        };
        return CC_RESPONSE.send('notificaciones obtenidas con éxito', data, 'COPES001', RESPONSE_PARSED);
        // return _res.status(200).json(RESPONSE_PARSED);
    } catch (_error) {
        return CC_RESPONSE.sendError(!_error.errorType ? new ErrorUtilClass(__filename, 'COPEE003', _error).server() : _error);
    }
}

const getAllNotificationsApi = async(cedula) => {
    let data = {
        "cedula": cedula
    }
    
    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${API_NOTIFICATIONS}get-notifications`,
        headers: { 
          'Content-Type': 'application/json'
        },
        data : data
    };
    
    try {
        const response = await axios.request(config);
        return response.data;
    } catch (error) {
        console.log('error... ', error);
        return error;
    }

}

const setNotificationRead = async (_req, _res) => {
    const CC_RESPONSE = new ResponseUtilClass(_req, _res);
    console.log('req body',_req.body);
    // const BODY = {
    //     id: id,
    // }
    const data = _req.body;
    let {_id} = data;
    console.log('id',_id);

    try {
        const setNotify = await setNotificationReadApi(_id);
        const RESPONSE_PARSED = {
            responseCode: 'BCV00OK',
            setNotify: setNotify
        };
        return CC_RESPONSE.send('notificaciones obtenidas con éxito', data, 'COPES001', RESPONSE_PARSED);
        // return _res.status(200).json(RESPONSE_PARSED);
    } catch (_error) {
        return CC_RESPONSE.sendError(!_error.errorType ? new ErrorUtilClass(__filename, 'COPEE003', _error).server() : _error);
    }
}

const setNotificationReadApi = async (id) => {
    let data = {
        "_id": id
    }
    console.log('data set ',data);
    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${API_NOTIFICATIONS}set-notification-read`,
        headers: { 
          'Content-Type': 'application/json'
        },
        data : data
    };

    try {
        const response = await axios.request(config);
        return response.data;
    } catch (error) {
        console.log('error... ', error);
        return error;
    }

} 

const getCountNotifications = async (_req, _res) => {
    const CC_RESPONSE = new ResponseUtilClass(_req, _res);
    const data = JSON.parse(_req.body);
    let {cedula} = data;
    console.log('cedula... ',cedula)
    // const BODY = {
    //     cedula: cedula
    // }

    const notifications = await getCountNotificationsApi(cedula);
    try {
        
        const RESPONSE_PARSED = {
            responseCode: 'BCV00OK',
            notifications: notifications
        };
        return CC_RESPONSE.send('notificaciones obtenidas con éxito', data, 'COPES001', RESPONSE_PARSED);
        // return _res.status(200).json(RESPONSE_PARSED);
    } catch (_error) {
        return CC_RESPONSE.sendError(!_error.errorType ? new ErrorUtilClass(__filename, 'COPEE003', _error).server() : _error);
    }
}

const getCountNotificationsApi = async (cedula) =>{
    let data = {
        "cedula": cedula
    }

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${API_NOTIFICATIONS}count-notifications`,
        headers: { 
          'Content-Type': 'application/json'
        },
        data : data
    };

    try {
        const response = await axios.request(config);
        return response.data.count;
    } catch (error) {
        console.log('error... ', error);
        return error;
    }

}


module.exports = {
    getNotifications,
    setNotificationRead,
    getCountNotifications,
    getAllNotificationsApi,
    setNotificationReadApi,
    getCountNotificationsApi,
		updateFcmToken
};