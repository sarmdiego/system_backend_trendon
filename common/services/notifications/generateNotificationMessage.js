const MESSAGE_TYPE_NOTIFICATION = {
  ACTIVIDAD_REALIZADO: 0,
  ACTIVIDAD_RECIBIDO: 1,
  Acción_RECIBIDA_CTA: 2,
  Acción_RECIBIDA_TLF: 3,
  Acción_REALIZADA_CTA: 4,
  Acción_REALIZADA_TLF: 5,
  PAGO_DE_Entrada_PREPAGO: 6,
  PAGO_DE_Entrada_POSTPAGO: 7,
};

const NotificationTypes = {
  0: 'Actividad Realizado',
  1: 'Actividad Recibido',
  2: 'Acción Recibida Por el Local',
  3: 'Acción Recibida Por el Evento',
  4: 'Acción Realizada Por el Local',
  5: 'Acción Realizada Por el Evento',
  6: 'Pago de Entrada Prepago',
  7: 'Pago de Entrada Postpago',
};

function generateNotificationMessage(type, data) {
  console.log({ type, data });
  const templates = {
    0: `Realizaste un Actividad en ${data.monto} al nro. ${data.telefono}, Ref. ${data.referencia} de fecha ${data.fecha_hora}. Inf: al `,
    1: `Recibiste un Actividad en ${data.monto} del nro. ${data.telefono}, Ref. ${data.referencia} de fecha ${data.fecha_hora}. Inf: al `,
    2: `Recibiste una Acción en ${data.monto} de ${data.cuenta}, Ref. ${data.referencia} de fecha ${data.fecha_hora}. Inf: al `,
    3: `Recibiste una Acción en ${data.monto} del nro. ${data.telefono}, Ref. ${data.referencia} de fecha ${data.fecha_hora}. Inf: al `,
    4: `Realizaste una Acción en ${data.monto} a ${data.cuenta}, Ref. ${data.referencia} de fecha ${data.fecha_hora}. Inf: al `,
    5: `Realizaste una Acción en ${data.monto} al nro. ${data.telefono}, Ref. ${data.referencia} de fecha ${data.fecha_hora}. Inf: al `,
    6: `Reservación exitosa! Has Reservado Bs. ${data.monto} al ${data.telefono}. Ref. ${data.referencia} de fecha ${data.fecha_hora}. Inf: al `,
    7: `¡Pago exitoso! Has pagado Bs. ${data.monto} al ${data.telefono_contrato}. Ref. ${data.referencia} de fecha ${data.fecha_hora}. Inf: al `,
  };

  return templates[type];
}

module.exports = {
  NotificationTypes,
  generateNotificationMessage,
  MESSAGE_TYPE_NOTIFICATION
};