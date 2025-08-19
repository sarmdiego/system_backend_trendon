const AccessControl = require('../models/access_control.model');
const { CC_OWN_CONST } = require('../configs');
const ResponseUtilClass = require('../../common/utils/response.util_class');
const ErrorUtilClass = require('../../common/utils/error.util_class');

module.exports = async (_req, _res, _next) => {
  const CC_RESPONSE = new ResponseUtilClass(_req, _res, _next);
  const ACCESS_CONTROL_CHANCE_TIME = process.env.CC_ACCESS_CONTROL_CHANCE ? parseInt(process.env.CC_ACCESS_CONTROL_CHANCE) : 3;
  console.log({ ACCESS_CONTROL_CHANCE_TIME });
  console.log({ PROCESS_CONTROL_CC: process.env.CC_ACCESS_CONTROL_CHANCE });
  console.log({ PROCESS_CONTROL_CHANCE_TIME: process.env.ACCESS_CONTROL_CHANCE_TIME });

  const DOCUMENT_TYPE = Object.keys(CC_OWN_CONST.DOCUMENT_TYPE).find((key) => CC_OWN_CONST.DOCUMENT_TYPE[key] == _req.body.idDocumentType);
  const uid = DOCUMENT_TYPE + _req.body.documentNumber;
  const idStep = _req.body.idStep;
  console.log(uid);
  const route = `${_req.originalUrl}/${idStep}`;
  console.log(route);
  //const shortTimeWindow = 1 * 60 * 1000; // 1 minuto
  const oneDayWindow = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
  const longTimeWindow = 24 * 60 * 60 * 1000; // 24 horas

  try {
    // Verificar si el usuario está bloqueado
    const blockedUser = await AccessControl.findOne({
      uid,
      locked: true,
      blockedUntil: { $gt: new Date() },
    });

    if (blockedUser) {
      /* return _res.status(403).json({
                message: 'Acceso bloqueado. Intente de nuevo después de 24 horas.',
                blockedUntil: blockedUser.blockedUntil
            }); */
      //throw new ErrorUtilClass(__filename, 'MMULPE001', 'parametro _file vacío para middleware de archivos').server();
      throw new ErrorUtilClass(__filename, 'CAUTE034', null, 'Por favor intente más tarde.').frontend(400);
    }

    // Registrar el nuevo acceso y obtener el conteo
    const result = await AccessControl.findOneAndUpdate(
      { uid, route },
      {
        $set: {
          last_updated_at: new Date(),
          logical_erase: false,
        },
        $setOnInsert: {
          created_date: new Date(),
          core_db: process.env.CC_CORE_NAME,
          user_db: process.env.CC_MDB_USER,
          schema_db: '1.0.0',
        },
        $push: {
          accessTimes: {
            $each: [new Date()],
            $slice: -10, // Mantener solo los últimos 10 accesos
          },
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    console.log('Resultado de findOneAndUpdate:', JSON.stringify(result, null, 2));

    // Si accessTimes no existe, inicialízalo
    if (!result.accessTimes) {
      result.accessTimes = [new Date()];
      await result.save();
    }

    /* const recentAccessCount = result.accessTimes.filter(time => 
            time > new Date(Date.now() - shortTimeWindow)
        ).length; */

    const recentAccessCount = result.accessTimes.filter((time) => time > new Date(Date.now() - oneDayWindow)).length;

    console.log('Conteo de accesos recientes:', recentAccessCount);

    if (recentAccessCount > 3) {
      // Bloquear al usuario
      await AccessControl.updateOne(
        { uid, route },
        {
          $set: {
            locked: true,
            blockedUntil: new Date(Date.now() + longTimeWindow),
          },
        }
      );

      throw new ErrorUtilClass(__filename, 'CAUTE034', null, 'Por favor intente más tarde.').frontend(400);
      // return _res.status(403).json({
      //     message: 'Demasiadas solicitudes. Acceso bloqueado por 24 horas.',
      //     blockedUntil: new Date(Date.now() + longTimeWindow)
      // });
    }

    _next();
  } catch (_error) {
    console.error('Error en rate limiting:', _error);
    return CC_RESPONSE.sendError(!_error.errorType ? new ErrorUtilClass(__filename, 'MMULPE007', _error).server() : _error);
  }
};
