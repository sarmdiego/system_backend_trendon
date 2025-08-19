const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  cedula: { type: String, required: true, index: true },
  tipoNotificacion: { type: String, required: true },
  fechaEnviada: { type: Date, default: Date.now },
  leida: { type: Boolean, default: false },
  titulo: { type: String, required: true },
  mensaje: { type: String, required: true },
  ruta: { type: String, required: false },
  status: { type: Number, min: 0, max: 4, required: true, index: true }
});

// Crear índices
notificationSchema.index({ cedula: 1 });
notificationSchema.index({ status: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

// Crear los índices al inicializar el modelo
Notification.createIndexes();

module.exports = Notification;