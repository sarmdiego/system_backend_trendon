const { CC_OWN_CONST } = require('../configs');
// const Logs = require('../models/postgres/logs');

const logMiddleware = ({ accion, modulo }) => {
	return async (req, res, next) => {
		// console.log({ logReqMidleware: req, moduloReq: modulo })
		// console.log({ CCPAVEMT_DB_USER: req.CC.MT_DB_USER })
		// console.log({ CCPAVE: req.CC })
		// console.log({ res: res })
		try {
			const DOCUMENT_TYPE = Object.keys(CC_OWN_CONST.DOCUMENT_TYPE).find((key) => CC_OWN_CONST.DOCUMENT_TYPE[key] == req.body.idDocumentType) ?? '';
			const DOCUMENT_NUMBER = req?.body?.documentNumber ?? ''

      let usuario = `${DOCUMENT_TYPE}${DOCUMENT_NUMBER}`

			if (DOCUMENT_TYPE == '' && DOCUMENT_NUMBER == '') { 
				usuario = req?.CC?.MT_DB_USER?.uid
			}
		
			const dispositivo = req.headers['agent'] ?? 'unknown'; // Obtiene el valor del encabezado 'agent' o usa 'unknown' como valor predeterminado
      const ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress; // Obtiene la IP desde los headers o la conexión
      const data_peticion = JSON.stringify(req.body); // Serializa el cuerpo de la solicitud

      // Crear el log en la base de datos
      await Logs.create({
        usuario,
        dispositivo,
        ip_address,
        fecha: new Date(),
        ruta_id: modulo,
        data_peticion,
        estatus: true,
        created_at: new Date(),
        updated_at: new Date()
      });

      next(); // Llama a la siguiente función de middleware o controlador
    } catch (error) {
      console.error('Error al registrar el log:, seguimos flujo', error);
      next(); // Pasa el error al siguiente middleware
    }
  };
};

module.exports = logMiddleware;