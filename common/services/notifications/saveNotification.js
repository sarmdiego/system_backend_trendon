const Notification = require('../../../app/models/notifications.model');

async function saveNotification(userDeviceToken, tipoNotificacion, data) {
  const titulo = 'Trendon Informa';
  const mensaje = data.mensaje; // Usar el mensaje generado desde el controlador
  const ruta = ''; // Define la ruta según sea necesario
  const status = 0; // Define el estado según sea necesario

  const newNotification = new Notification({
    userDeviceToken,
    bussinessName,
    tipoNotificacion,
    titulo,
    mensaje,
    ruta,
    status,
  });

  console.log({ newNotification });
  try {
    await newNotification.save();
    console.log('Notificación guardada');
  } catch (error) {
    console.log('Error guardando la notificación:', error);
    throw error;
  }
}

async function saveNotification400(userDeviceToken, tipoNotificacion, mensaje) {
  const titulo = 'Trendon Informa';
  const ruta = ''; // Define la ruta según sea necesario
  const status = 0; // Define el estado según sea necesario

  const newNotification = new Notification({
    userDeviceToken,
    bussinessName,
    tipoNotificacion,
    titulo,
    mensaje,
    ruta,
    status,
  });

  console.log({ newNotification });
  try {
    await newNotification.save();
    console.log('Notificación guardada');
  } catch (error) {
    console.log('Error guardando la notificación:', error);
    throw error;
  }
}

module.exports = {
	saveNotification,
	saveNotification400
};