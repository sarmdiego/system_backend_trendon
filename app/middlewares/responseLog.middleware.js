// const Logs = require('../models/postgres/logs');

const responseLogMiddleware = ({ accion, modulo }) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    const originalJson = res.json;

    const createLog = async (body) => {
      try {
        const usuario = req.headers['x-user-id'] ?? 'unknown';
        const dispositivo = req.headers['user-agent'] ?? 'unknown';
        const ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const data_peticion = JSON.stringify(req.body);
        const data_respuesta = JSON.stringify(body);

        await Logs.create({
          usuario,
          dispositivo,
          ip_address,
          fecha: new Date(),
          ruta_id: modulo,
          data_peticion,
          data_respuesta,
          estatus: true,
          created_at: new Date(),
          updated_at: new Date()
        });
      } catch (error) {
        console.error('Error al registrar el log de respuesta:', error);
      }
    };

    res.send = async function (body) {
      await createLog(body);
      return originalSend.call(this, body);
    };

    res.json = async function (body) {
      await createLog(body);
      return originalJson.call(this, body);
    };

    next();
  };
};

module.exports = responseLogMiddleware;