const mongoose = require('mongoose');

const accessControlSchema = new mongoose.Schema(
  {
    uid: {
        type: String,
        required: true,
    },
    route: {
      type: String,
      required: true,
    },
    accessTimes: { type: [Date], default: [] },
    logical_erase: {
      type: Boolean,
      required: true,
      description: 'Borrado lógico',
      default: false,
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
      default: '1.0.0',
      required: false,
    },
    created_date: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
    last_updated_at: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
    locked: {
      type: Boolean,
      default: false
    },
    blockedUntil: {
      type: Date
    }
  },
  { versionKey: false }
);

// Índice compuesto para optimizar las consultas
accessControlSchema.index({ uid: 1, route: 1, accessTime: 1 });

// Añadimos un índice adicional para optimizar las consultas de bloqueo
accessControlSchema.index({ uid: 1, route: 1, locked: 1, blockedUntil: 1 });

module.exports = mongoose.model('AccessControl', accessControlSchema, 'access_control');