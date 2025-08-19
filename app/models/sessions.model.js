const mongoose = require('mongoose');

const refreshTokensSubschema = new mongoose.Schema(
  {
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
    expiration_date: {
      type: Date,
      required: true,
    },
    is_used: {
      type: Boolean,
      required: true,
      default: false,
    },
    request: {
      type: Object,
      required: false,
    },
    response: {
      type: Object,
      required: false,
    },
    nonce: {
      type: String,
      required: false,
    },
    signature: {
      type: String,
      required: false,
    },
    token_origin: {
      type: String,
      required: true,
      default: ' ',
    },
    nonce: {
      type: Number,
      required: false,
    },
  },
  { versionKey: false }
);

const sessionsSchema = new mongoose.Schema(
  {
    is_active: {
      type: Boolean,
      required: true,
      default: true,
    },
    uid: {
      type: String,
      required: true,
      index: true, // Índice agregado a `uid`
    },
    metadata: {
      type: Object,
      required: true,
    },
    remote_ip_addr: {
      type: String,
      required: true,
    },
    front_version: {
      type: String,
      required: false,
      default: 'Undefined',
    },
    proxy_ip_addr: {
      type: String,
      required: false,
    },
    http_headers: {
      type: Object,
      required: true,
      default: {},
    },
    location: {
      type: Object,
			required: false,
      default: {},
    },
    user_agent: {
      type: Object,
      required: true,
      default: {},
    },
    external_token: {
      type: String,
      required: true,
    },
    token_parent: {
      type: String,
      required: false,
      default: null,
    },
    refresh_tokens: [refreshTokensSubschema],
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
    expiration_date: {
      type: Date,
      required: true,
    },
    logical_erase: {
      type: Boolean,
      required: true,
      description: 'Borrado Logico',
      default: false,
    },
    core_db: {
      type: String,
      description: 'Nombre del Core de Base de datos que hizo el registro',
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
      description: 'Versionado de la Base de datos.',
      default: '1.1.0',
      required: false,
    },
  },
  { versionKey: false }
);

// Crear índices para mejorar el rendimiento de las consultas
sessionsSchema.index({ uid: 1 }); // Índice compuesto de `uid` e `is_active`

module.exports = mongoose.model('sessions', sessionsSchema, 'sessions');