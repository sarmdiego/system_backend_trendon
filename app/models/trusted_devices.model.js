const mongoose = require('mongoose');

const trustedDeviceSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      description: 'Identificador único del usuario',
      required: true,
      index: true,
    },
    uidfcm: {
      type: String,
      description: 'Identificador único del Firebase para notificaciones',
      required: true,
      index: true,
    },
    device_id: {
      type: String,
      required: true,
      index: true,
    },
    created_date: {
      type: Date,
      description: 'Fecha de creación del documento',
      required: true,
      default: () => new Date(),
    },
    last_updated_at: {
      type: Date,
      description: 'Fecha de actualización del documento',
      required: true,
      default: () => new Date(),
    },
    core_db: {
      type: String,
      description: 'Nombre del core de base de datos que hizo el registro',
      default: process.env.CC_CORE_NAME,
      required: false,
    },
    user_db: {
      type: String,
      description: 'Usuario de Base de datos que hizo el registro',
      default: process.env.CC_MDB_USER,
      required: false,
    },
    schema_db: {
      type: String,
      description: 'Versionado de la base de datos.',
      default: '1.2.0',
      required: false,
    },
    logical_erase: {
      type: Boolean,
      required: true,
      description: 'Borrado lógico',
      default: false,
    },
  },

  { versionKey: false }
);

module.exports = mongoose.model('trusted_devices', trustedDeviceSchema, 'trusted_devices');
