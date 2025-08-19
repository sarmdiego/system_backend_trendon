'use strict';

const bridgeRequestUtilClass = require('../../common/utils/bridge_request.util_class');
const ResponseUtilClass = require('../../common/utils/response.util_class');
const ParseExpressValidatorUtilClass = require('../../common/utils/parse_express_validator.util_class');
const ErrorUtilClass = require('../../common/utils/error.util_class');
const { CC_OWN_CONST } = require('../configs');
const { updateTokenService, createTokenSessionService, structuringRequesttrdService, decryptDataService, listPreferencesService, parsetrdNumberService } = require('../services/util.service');
const { saveNotification } = require('../../common/services/notifications/saveNotification');
const { generateNotificationMessage, NotificationTypes, MESSAGE_TYPE_NOTIFICATION } = require('../../common/services/notifications/generateNotificationMessage');
// const { NotificationTypes } = require('../../common/services/notifications/generateNotificationMessage');
// const { saveNotification } = require('../../common/services/notifications/saveNotification');
// process.env.EXT_TRENDON_EXCHANGE_API = 'http://10.112.23.13:8087';
// process.env.EXT_TRENDON_EXCHANGE_API_KEY = '18354e0f-81c5-4b1f-951f-a5ee096269cc';
module.exports = {
  
  /**
   * Transferencia a terceros mismo banco
   * @param {*} _req
   * @param {*} _res
   * @returns
   */
  thirdsSameBankController: async (_req, _res) => {
    const CC_RESPONSE = new ResponseUtilClass(_req, _res);
    try {
      //Validamos que no hayan errores de formato
      const CHECK_ERRORS = new ParseExpressValidatorUtilClass(_req).byFormatValidate();
      if (!CHECK_ERRORS.isEmpty()) throw new ErrorUtilClass(__filename, 'COPEE011', CHECK_ERRORS.values()).returnValidate(false);

      if (!_req.CC.MT_DB_USER?.accountList) throw new ErrorUtilClass(__filename, 'COPEE012', null, 'Primero debe consultar el listado de cuentas').frontend();
      if (!_req.CC.MT_DB_USER?.accountList[Number(_req.body?.idAba) - 1]?.accountNumber)
        throw new ErrorUtilClass(__filename, 'COPEE013', { idAba: _req.body?.idAba }, 'Debe enviar un identificador de cuenta válido').frontend();

      const DOCUMENT_TYPE = Object.keys(CC_OWN_CONST.DOCUMENT_TYPE).find((key) => CC_OWN_CONST.DOCUMENT_TYPE[key] == _req.body.idDocumentType);

      const BODY = {
        encabezado: {
          canal: '02',
          categoria: '2',
          servicio: '1',
          transaccion: '1',
        },

        datos: {
          user: _req.CC.MT_DB_USER.uid,
          // tipoTransaccion: '02',
          cuentaOrigen: _req.CC.MT_DB_USER?.accountList[Number(_req.body?.idAba) - 1]?.accountNumber,
          cuentaDestino: _req.body.sendAccount,
          nacionalidad: DOCUMENT_TYPE,
          cedula: _req.body.documentNumber,
          nombre: 'APP',
          monto: String(_req.body.amount).replaceAll(/[.,]/g, ''),
        },
      };

      // LLamado del API
      const RESPONSE = await structuringRequesttrdService(process.env.EXT_TRENDON_ORCH_API, '/bbu/orch', 'POST', BODY, null, null, _req.CC.refreshToken).catch((_error) => {
        throw new ErrorUtilClass(__filename, 'COPEE014').parseCatch(_error);
      });

      if (!RESPONSE.data[0]?.informacion) throw new ErrorUtilClass(__filename, 'COPEE015', null, 'error al obtener la información de la transacción.').frontend();

      if (RESPONSE.data[0].informacion.codigo != '00')
        throw new ErrorUtilClass(__filename, 'COPEE016', { errorCode: RESPONSE.data[0].informacion.codigo }, RESPONSE.data[0].informacion.descripcion).frontend();

      const RESPONSE_PARSED = {
        service: RESPONSE.data[0].informacion.servicio,
        description: RESPONSE.data[0].informacion.descripcion,
        referenceNumber: RESPONSE.data[0].informacion.referencia,
        amount: await parsetrdNumberService(RESPONSE.data[0].informacion.monto),
        commission: await parsetrdNumberService(RESPONSE.data[0].informacion.comisionInterbancaria),
        igtf: await parsetrdNumberService(RESPONSE.data[0].informacion.igtf),
        interbankIgtfCommission: await parsetrdNumberService(RESPONSE.data[0].informacion.igtfInterbancaria),
        availableBalance: await parsetrdNumberService(RESPONSE.data[0].informacion.saldoDisponible),
      };

			// Guardar notificación para el remitente
      const notificationDataSender = {
        monto: _req.body.amount,
        cuenta:'trd' + '*'.repeat(12) + _req.body.sendAccount.slice(-4),
        telefono: _req.body.sendPhone,
        referencia: RESPONSE.data[0].informacion.referencia,
        fecha_hora: new Date().toLocaleString()
      };

			const mensajeSender = generateNotificationMessage(MESSAGE_TYPE_NOTIFICATION.TRANSFERENCIA_REALIZADA_CTA, notificationDataSender);
      await saveNotification(_req.CC.MT_DB_USER.uid, MESSAGE_TYPE_NOTIFICATION.TRANSFERENCIA_REALIZADA_CTA, { ...notificationDataSender, mensaje: mensajeSender });

      // Guardar notificación para el destinatario
      const notificationDataReceiver = {
        monto: _req.body.amount,
				cuenta:'trd' + '*'.repeat(12) + _req.CC.MT_DB_USER?.accountList[Number(_req.body?.idAba) - 1]?.accountNumber.slice(-4),
        telefono: _req.CC.MT_DB_USER.userPhone,
        referencia: RESPONSE.data[0].informacion.referencia,
        fecha_hora: new Date().toLocaleString()
      };

			const mensajeReceiver = generateNotificationMessage(MESSAGE_TYPE_NOTIFICATION.TRANSFERENCIA_RECIBIDA_CTA, notificationDataReceiver);
      await saveNotification(`${DOCUMENT_TYPE}${_req.body.documentNumber}`, MESSAGE_TYPE_NOTIFICATION.TRANSFERENCIA_RECIBIDA_CTA, { ...notificationDataReceiver, mensaje: mensajeReceiver });
      
			// Respondemos solicitud
			return CC_RESPONSE.send(RESPONSE.data[0].resultado.message, RESPONSE.data[0].informacion, 'COPES003', RESPONSE_PARSED);
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new ErrorUtilClass(__filename, 'COPEE017', _error).server() : _error);
    }
  },

  /**
	 * Controlador de todos los servicios de pago de servicios

	 * @param {*} _req
	 * @param {*} _res
	 * @returns
	 */
  paymentServiceController: async (_req, _res) => {
    const CC_RESPONSE = new ResponseUtilClass(_req, _res);
    try {
      // Verificamos si tiene errores de formato
      const CHECK_ERRORS = new ParseExpressValidatorUtilClass(_req).byFormatValidate();
      if (!CHECK_ERRORS.isEmpty()) throw new ErrorUtilClass(__filename, 'DVLISE001', CHECK_ERRORS.values()).returnValidate(false);

      // Construcción inicial del body
      const BODY = {
        encabezado: {
          canal: '02',
          categoria: '3',
          servicio: null,
          transaccion: null,
        },
        datos: {
          canal: '02',
        },
      };

      if (_req.body.idAba) {
        if (!_req.CC.MT_DB_USER?.accountList) throw new ErrorUtilClass(__filename, 'COPEE026', null, 'Primero debe consultar el listado de cuentas').frontend();
        if (!_req.CC.MT_DB_USER?.accountList[Number(_req.body?.idAba) - 1]?.accountNumber)
          throw new ErrorUtilClass(__filename, 'COPEE027', { idAba: _req.body?.idAba }, 'Debe enviar un identificador de cuenta válido').frontend();
      }

      //Entramos en este switch para poder determinar cuál llamado debemos realizar
      let responseParsed;
      let responseUnparsed;
      let statusCode;
      let currentDate = new Date();
      switch (_req.body.idService) {
        case CC_OWN_CONST.PAYMENT_SERVICE_SERVICES.MOVILNET_RECHARGE:
          //Validamos el formato del teléfono
          const MOVILNET_OPERATOR_REGEX = _req.body.numberService.match(/0?(?<operator>416|426)/);
          const MOVILNET_NUMBER_REGEX = _req.body.numberService.match(/0?(?:416|426)(?<number>\d{7})/);
          if (!MOVILNET_OPERATOR_REGEX?.groups?.operator)
            throw new ErrorUtilClass(__filename, 'COPEE070', { numberService: _req.body.numberService }, 'El código de la operadora no es válido').frontend();
          if (!MOVILNET_NUMBER_REGEX?.groups?.number) throw new ErrorUtilClass(__filename, 'COPEE071', { numberService: _req.body.numberService }, 'El formato del teléfono no es válido').frontend();

        case CC_OWN_CONST.PAYMENT_SERVICE_SERVICES.CANTV_RECHARGE:
          //Setteamos los encabezados para enrutar la consulta o recarga
          BODY.encabezado.servicio = _req.body.idService == CC_OWN_CONST.PAYMENT_SERVICE_SERVICES.MOVILNET_RECHARGE ? '1' : '2';
          BODY.encabezado.transaccion = _req.body.isQuery ? '1' : '2';
          //Setteamos los parámetros de la data
          let typeService;
          if (_req.body?.numberService.length == 10 || _req.body?.numberService.length == 11) {
            typeService = '10';
          } else {
            typeService = '20';
          }
          BODY.datos.instrumento = _req.body.numberService;
          BODY.datos.servicio = typeService;
          BODY.datos.montoDeuda = _req.body?.owedAmount ? String(_req.body.owedAmount).replaceAll(/[.,]/g, '') : null;
          BODY.datos.montoPago = _req.body?.paymentAmount ? String(_req.body?.paymentAmount).replaceAll(/[.,]/g, '') : null;
          BODY.datos.cuenta = _req.body?.idAba ? _req.CC.MT_DB_USER?.accountList[Number(_req.body?.idAba) - 1]?.accountNumber : null;

          responseUnparsed = await structuringRequesttrdService(process.env.EXT_TRENDON_ORCH_API, '/bbu/orch', 'POST', BODY, null, null, _req.CC.refreshToken).catch((_error) => {
            throw new ErrorUtilClass(__filename, 'COPEE028').parseCatch(_error);
          });

          if (!responseUnparsed?.data[0]) {
            responseParsed = null;
            statusCode = 400;
          } else {
            responseParsed = {
              responseCode: responseUnparsed.data[0]?.informacion?.codigo,
              idTypeService: responseUnparsed.data[0]?.informacion?.servicio,
              owedAmount: await parsetrdNumberService(responseUnparsed.data[0].informacion.montoDeuda, 12),
              receiptAmount: await parsetrdNumberService(responseUnparsed.data[0].informacion.montoFactura, 12),
              receiptNumber: responseUnparsed.data[0]?.informacion?.nroFactura,
              receiptDate: responseUnparsed.data[0]?.informacion?.fechaFactura,
              referenceNumber: responseUnparsed.data[0]?.informacion?.autorizacionCtc,
            };
            statusCode = responseUnparsed.data[0]?.resultado?.status == 1 ? 200 : 400;
          }

          break;
        case CC_OWN_CONST.PAYMENT_SERVICE_SERVICES.MOVISTAR_PREPAID_RECHARGE:
          //Validamos el formato del teléfono
          const MOVISTAR_OPERATOR_REGEX = _req.body.numberService.match(/0?(?<operator>414|424)/);
          const MOVISTAR_NUMBER_REGEX = _req.body.numberService.match(/0?(?:414|424)(?<number>\d{7})/);
          if (!MOVISTAR_OPERATOR_REGEX?.groups?.operator)
            throw new ErrorUtilClass(__filename, 'COPEE072', { numberService: _req.body.numberService }, 'El código de la operadora no es válido').frontend();
          if (!MOVISTAR_NUMBER_REGEX?.groups?.number) throw new ErrorUtilClass(__filename, 'COPEE073', { numberService: _req.body.numberService }, 'El formato del teléfono no es válido').frontend();

        case CC_OWN_CONST.PAYMENT_SERVICE_SERVICES.MOVISTAR_POSTPAID_RECHARGE:
          //Setteamos los encabezados para enrutar la consulta o recarga
          BODY.encabezado.servicio = '3';
          BODY.encabezado.transaccion = _req.body.isQuery ? '1' : '2';
          //Setteamos los parámetros de la data
          BODY.datos.instrumento = _req.body?.numberService;
          BODY.datos.codigoProducto = _req.body?.idTypeService;
          BODY.datos.modalidad = _req.body.idService == CC_OWN_CONST.PAYMENT_SERVICE_SERVICES.MOVISTAR_PREPAID_RECHARGE ? '01' : '02';
          BODY.datos.cuenta = _req.body?.idAba ? _req.CC.MT_DB_USER?.accountList[Number(_req.body?.idAba) - 1]?.accountNumber : null;
          BODY.datos.monto = _req.body?.amount ? String(_req.body?.amount).replaceAll(/[.,]/g, '') : null;

          responseUnparsed = await structuringRequesttrdService(process.env.EXT_TRENDON_ORCH_API, '/bbu/orch', 'POST', BODY, null, null, _req.CC.refreshToken).catch((_error) => {
            throw new ErrorUtilClass(__filename, 'COPEE029').parseCatch(_error);
          });
          if (!responseUnparsed?.data[0]) {
            responseParsed = null;
            statusCode = 400;
          } else {
            responseParsed = {
              responseCode: responseUnparsed.data[0]?.informacion?.codigo,
              owedAmount: await parsetrdNumberService(responseUnparsed.data[0].informacion.saldoDeudor, 16),
              approvalCode: responseUnparsed.data[0]?.informacion?.codigoAprobacion,
              approvalCodeShort: responseUnparsed.data[0]?.informacion?.codigoAprobacionCorto,
              referenceNumber: responseUnparsed.data[0]?.informacion?.autorizacionCtc,
            };
            statusCode = responseUnparsed.data[0]?.resultado?.status == 1 ? 200 : 400;
          }
          break;
        case CC_OWN_CONST.PAYMENT_SERVICE_SERVICES.DIGITEL_POSTPAID_RECHARGE:
          //Setteamos los encabezados para enrutar la consulta o recarga
          BODY.encabezado.servicio = '4';
          BODY.encabezado.transaccion = _req.body.isQuery ? '1' : '4';
          //Setteamos los parámetros de la data
          BODY.datos.telefono = _req.body?.numberService;
          BODY.datos.cuenta = _req.body?.idAba ? _req.CC.MT_DB_USER?.accountList[Number(_req.body?.idAba) - 1]?.accountNumber : null;
          BODY.datos.monto = _req.body?.amount ? String(_req.body?.amount).replaceAll(/[.,]/g, '') : null;

          responseUnparsed = await structuringRequesttrdService(process.env.EXT_TRENDON_ORCH_API, '/bbu/orch', 'POST', BODY, null, null, _req.CC.refreshToken).catch((_error) => {
            throw new ErrorUtilClass(__filename, 'COPEE030').parseCatch(_error);
          });
          if (!responseUnparsed?.data[0]) {
            responseParsed = null;
            statusCode = 400;
          } else {
            responseParsed = _req.body.isQuery
              ? {
                  responseCode: responseUnparsed.data[0]?.informacion?.codigo,
                  owedAmount: await parsetrdNumberService(responseUnparsed.data[0]?.informacion?.saldoPorVencer, 15),
                  expiredAmount: await parsetrdNumberService(responseUnparsed.data[0]?.informacion?.saldoVencido, 15),
                  totalAmount: await parsetrdNumberService(responseUnparsed.data[0]?.informacion?.saldoTotal),
                  paymentDue: responseUnparsed.data[0]?.informacion?.diaPago,
                  monthlyAmount: responseUnparsed.data[0]?.informacion?.pagoMensual,
                  date: responseUnparsed.data[0]?.informacion?.fecha,
                  referenceNumber: responseUnparsed.data[0]?.informacion?.autorizacionCtc,
                }
              : {
                  responseCode: responseUnparsed.data[0]?.informacion?.codigo,
                  amount: await parsetrdNumberService(responseUnparsed.data[0]?.informacion?.monto, 10),
                  referenceNumber: responseUnparsed.data[0]?.informacion?.autorizacionCtc,
                  paymentDate: responseUnparsed.data[0]?.informacion?.diaPago,
                  receiptDate: responseUnparsed.data[0]?.informacion?.fecha,
                };
            statusCode = responseUnparsed.data[0]?.resultado?.status == 1 ? 200 : 400;
          }
          break;
        case CC_OWN_CONST.PAYMENT_SERVICE_SERVICES.DIGITEL_PREPAID_RECHARGE:
          //Validamos el formato del teléfono
          const DIGITEL_OPERATOR_REGEX = _req.body.numberService.match(/0?(?<operator>412|422)/);
          const DIGITEL_NUMBER_REGEX = _req.body.numberService.match(/0?(?:412|422)(?<number>\d{7})/);
          if (!DIGITEL_OPERATOR_REGEX?.groups?.operator)
            throw new ErrorUtilClass(__filename, 'COPEE074', { numberService: _req.body.numberService }, 'El código de la operadora no es válido').frontend();
          if (!DIGITEL_NUMBER_REGEX?.groups?.number) throw new ErrorUtilClass(__filename, 'COPEE075', { numberService: _req.body.numberService }, 'El formato del teléfono no es válido').frontend();

          //Setteamos los encabezados para enrutar la consulta o recarga
          BODY.encabezado.servicio = '4';
          BODY.encabezado.transaccion = '2';
          //Setteamos los parámetros de la data
          BODY.datos.telefono = _req.body?.numberService;
          BODY.datos.cuenta = _req.CC.MT_DB_USER?.accountList[Number(_req.body?.idAba) - 1]?.accountNumber;
          BODY.datos.monto = _req.body?.amount ? String(_req.body?.amount).replaceAll(/[.,]/g, '') : null;

                // Obtener montos escaleras
                const BODY_DIGITEL_MONTOS_ESCALERAS = {
                  nombre: 'Digitel',
                  sub_tipo: 'Recarga',
                  tipo: 1,
                };

					const MONTOS_ESCALERAS = await structuringRequesttrdService(process.env.EXT_TRENDON_SIGNUP_API, '/api/services-mounts', 'POST', BODY_DIGITEL_MONTOS_ESCALERAS, process.env.EXT_TRENDON_ADMIN_TOKEN).catch((_error) => {
						throw new ErrorUtilClass(__filename, 'CLISE022').parseCatch(_error);
					});
					
					 // Validar que el monto esté en los valores permitidos
					 const valoresPermitidos = MONTOS_ESCALERAS.data[0].valores.map((item) => item.valor);
					 if (BODY.encabezado.categoria === '3' && BODY.encabezado.servicio === '4' && BODY.encabezado.transaccion === '2') {
						 if (!valoresPermitidos.includes(String(BODY.datos.monto.slice(0, -2)))) {
								console.log({ MONTO_A_RECARGAR: BODY.datos.monto})
							 throw new ErrorUtilClass(__filename, 'CLISE023', null, 'El monto no está permitido').frontend();
						 }
					 }
					console.log({ MONTOS_ESCALERAS: MONTOS_ESCALERAS.data[0].valores });
					console.log({ BODY });
					
          responseUnparsed = await structuringRequesttrdService(process.env.EXT_TRENDON_ORCH_API, '/bbu/orch', 'POST', BODY, null, null, _req.CC.refreshToken).catch((_error) => {
            throw new ErrorUtilClass(__filename, 'COPEE031').parseCatch(_error);
          });

          if (!responseUnparsed?.data[0]) {
            responseParsed = null;
            statusCode = 400;
          } else {
            responseParsed = {
              responseCode: responseUnparsed.data[0]?.informacion?.codigo,
              amount: responseUnparsed.data[0]?.informacion?.amount,
              referenceNumber: responseUnparsed.data[0]?.informacion?.autorizacionCtc,
              idPayment: responseUnparsed.data[0]?.informacion?.idPago,
              paymentDate: responseUnparsed.data[0]?.informacion?.diaPago,
              receiptDate: responseUnparsed.data[0]?.informacion?.fecha,
            };
						statusCode = responseUnparsed.data[0]?.resultado?.status == 1 ? 200 : 400;
          }
          break;

        default:
          throw new ErrorUtilClass(__filename, 'COPEE077', { idService: _req.body.idService }, 'Debe enviar un identificador de servicio válido').frontend();
      }

			const REPUESTA_PAGO_SERVICIO = responseUnparsed.data[0]?.informacion
			console.log('responseUnparsed', responseUnparsed)
			console.log('responseUnparsed status', responseUnparsed?.status === 202)
			console.log('REPUESTA_PAGO_SERVICIO', REPUESTA_PAGO_SERVICIO)
			console.log('_req.CC.MT_DB_USER.uid', _req?.CC.MT_DB_USER?.uid)
			console.log('BODY', BODY)
			console.log('responseParsed', responseParsed)
			console.log({
				categoria: BODY.encabezado.categoria,
				servicio: BODY.encabezado.servicio,
				transaccion: BODY.encabezado.transaccion,
			})

			// NOTIFICACIONES
			if (responseUnparsed.status === 202) { 
				// Movilnet { categoria: '3', servicio: '1', transaccion: '2' }
				if(BODY.encabezado.categoria == 3 && BODY.encabezado.servicio == 1 && BODY.encabezado.transaccion == 2) {
					const notificationMovilnet = {
						monto: (BODY?.datos?.montoPago/100).toFixed(2),
						telefono: BODY?.datos?.instrumento,
						referencia: responseParsed?.referenceNumber,
						fecha_hora: new Date().toLocaleString()
					};
					const mensajeSender = generateNotificationMessage(MESSAGE_TYPE_NOTIFICATION.PAGO_DE_SERVICIOS_PREPAGO, notificationMovilnet);
					await saveNotification(_req.CC.MT_DB_USER.uid, MESSAGE_TYPE_NOTIFICATION.PAGO_DE_SERVICIOS_PREPAGO, { ...notificationMovilnet, mensaje: mensajeSender });
				}
				// Movistar { categoria: '3', servicio: '1', transaccion: '2' }
				if (BODY.encabezado.categoria == 3 && BODY.encabezado.servicio == 3 && BODY.encabezado.transaccion == 2) {
					// PREPAGO
					if(BODY?.datos?.modalidad == '01') {
						const notificationMovistarPrepago = {
							monto: (BODY?.datos?.monto/100).toFixed(2),
							telefono: BODY?.datos?.instrumento,
							referencia: responseParsed?.referenceNumber,
							fecha_hora: new Date().toLocaleString()
						};
						const mensajeSender = generateNotificationMessage(MESSAGE_TYPE_NOTIFICATION.PAGO_DE_SERVICIOS_PREPAGO, notificationMovistarPrepago);
						await saveNotification(_req.CC.MT_DB_USER.uid, MESSAGE_TYPE_NOTIFICATION.PAGO_DE_SERVICIOS_PREPAGO, { ...notificationMovistarPrepago, mensaje: mensajeSender });
					}
					// POSTPAGO
					if(BODY?.datos?.modalidad == '02') {
            const notificationMovistarPostpago = {
              monto: (BODY?.datos?.monto/100).toFixed(2),
              telefono_contrato: BODY?.datos?.instrumento,
              referencia: responseParsed?.referenceNumber,
              fecha_hora: new Date().toLocaleString()
            };
            const mensajeSender = generateNotificationMessage(MESSAGE_TYPE_NOTIFICATION.PAGO_DE_SERVICIOS_POSTPAGO, notificationMovistarPostpago);
            await saveNotification(_req.CC.MT_DB_USER.uid, MESSAGE_TYPE_NOTIFICATION.PAGO_DE_SERVICIOS_POSTPAGO, {...notificationMovistarPostpago, mensaje: mensajeSender });
          }
				}
				// Digitel { categoria: '3', servicio: '4', transaccion: '2' }
				if (BODY.encabezado.categoria === '3' && BODY.encabezado.servicio === '4' && BODY.encabezado.transaccion === '2') {
					const notificationDigitel = {
						monto: (BODY?.datos?.monto/100).toFixed(2),
						telefono: BODY?.datos?.telefono,
						referencia: responseParsed?.referenceNumber,
						fecha_hora: new Date().toLocaleString()
					};
					const mensajeSender = generateNotificationMessage(MESSAGE_TYPE_NOTIFICATION.PAGO_DE_SERVICIOS_PREPAGO, notificationDigitel);
					await saveNotification(_req.CC.MT_DB_USER.uid, MESSAGE_TYPE_NOTIFICATION.PAGO_DE_SERVICIOS_PREPAGO, { ...notificationDigitel, mensaje: mensajeSender });
				}
				// CANTV { categoria: '3', servicio: '2', transaccion: '2' }
				if (BODY.encabezado.categoria === '3' && BODY.encabezado.servicio === '2' && BODY.encabezado.transaccion === '2') {
					const notificationCantv= {
						monto: (BODY?.datos?.montoPago/100).toFixed(2),
						telefono: BODY?.datos?.instrumento,
						referencia: responseParsed?.referenceNumber,
						fecha_hora: new Date().toLocaleString()
					};
					const mensajeSender = generateNotificationMessage(MESSAGE_TYPE_NOTIFICATION.PAGO_DE_SERVICIOS_PREPAGO, notificationCantv);
					await saveNotification(_req.CC.MT_DB_USER.uid, MESSAGE_TYPE_NOTIFICATION.PAGO_DE_SERVICIOS_PREPAGO, { ...notificationCantv, mensaje: mensajeSender });
				}
			}
      // Respondemos Solicitud
      return CC_RESPONSE.send(
        responseUnparsed.data[0]?.informacion?.descripcion || typeof responseUnparsed.data[0]?.informacion?.descripcion == 'string'
          ? responseUnparsed.data[0]?.informacion?.descripcion.replace(/\s*\./gm, '.')
          : 'Los servicios no están disponibles en este momento',
        responseUnparsed.data[0]?.informacion,
        'COPES005',
        responseParsed,
        statusCode
      );
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new ErrorUtilClass(__filename, 'COPEE032', _error).server() : _error);
    }
  },

  /**
   * Realizar pago móvil.
   * @param {*} _req
   * @param {*} _res
   * @returns
   */
  mobilePaymentController: async (_req, _res) => {
    const CC_RESPONSE = new ResponseUtilClass(_req, _res);
    try {
      // Verificamos si tiene errores de formato
      const CHECK_ERRORS = new ParseExpressValidatorUtilClass(_req).byFormatValidate();
      if (!CHECK_ERRORS.isEmpty()) throw new ErrorUtilClass(__filename, 'COPEE087', CHECK_ERRORS.values()).returnValidate(false);

      //Validamos
      if (!_req.CC.MT_DB_USER?.bankList) throw new ErrorUtilClass(__filename, 'COPEE033', null, 'Primero debe consultar el listado de bancos').frontend();
      if (!_req.CC.MT_DB_USER?.userPhone) throw new ErrorUtilClass(__filename, 'COPEE076', null, 'Primero debe consultar los valores iniciales de pago móvil').frontend();
      const DB_BANK = _req.CC.MT_DB_USER.bankList.find((bank) => bank.idBank == _req.body.idBank);
      if (!DB_BANK) throw new ErrorUtilClass(__filename, 'COPEE034', { idBank: _req.body.idBank }, 'Debe enviar un identificador de banco válido').frontend();

      let currentDate = new Date();
      const DOCUMENT_TYPE = Object.keys(CC_OWN_CONST.DOCUMENT_TYPE).find((key) => CC_OWN_CONST.DOCUMENT_TYPE[key] == _req.body.idDocumentType);

      //Determinamos el body a enviar dependiendo de los tipos de cédula del receptor y del emisor
      let parsedBody;
      if (CC_OWN_CONST.DOCUMENT_TYPE_BY_PERSON_TYPE.NATURAL_PERSON.includes(DOCUMENT_TYPE)) {
        let serviceType = 'P2P';
        if (CC_OWN_CONST.DOCUMENT_TYPE_BY_PERSON_TYPE.LEGAL_PERSON.includes(_req.CC.MT_DB_USER.documentType)) {
          serviceType = 'VDG';
        }
        //Armamos el body
        parsedBody = {
          encabezado: {
            canal: '02',
            categoria: '5',
            servicio: '1',
            transaccion: '2',
          },
          datos: {
            usuario: _req.CC.MT_DB_USER.uid,
            canal: '01',
            servicio: serviceType,
            telefonoOrigen: _req.CC.MT_DB_USER.userPhone,
            //Si se envió con un 0 al inicio lo eliminamos
            telefonoDestino: `58${_req.body.sendPhone?.charAt(0) == 0 ? _req.body.sendPhone.slice(1) : _req.body.sendPhone}`,
            bancoDestino: DB_BANK.code,
            cedulaDestino: `${DOCUMENT_TYPE}${_req.body.documentNumber}`,
            monto: String(_req.body.amount).replaceAll(/[.,]/g, ''),
            ipOrigen: _req.headers['x-forwarded-for'] || _req.socket.remoteAddress,
            concepto: _req.body.description,
          },
        };
      } else if (CC_OWN_CONST.DOCUMENT_TYPE_BY_PERSON_TYPE.LEGAL_PERSON.includes(DOCUMENT_TYPE)) {
        if (CC_OWN_CONST.DOCUMENT_TYPE_BY_PERSON_TYPE.LEGAL_PERSON.includes(_req.CC.MT_DB_USER.documentType)) {
          throw new ErrorUtilClass(__filename, 'COPEE078', null, 'No puede realizar un pago móvil a un usuario jurídico').frontend();
        }

        //Armamos el body
        parsedBody = {
          encabezado: {
            canal: '02',
            categoria: '5',
            servicio: '2',
            transaccion: '1',
          },
          datos: {
            usuario: _req.CC.MT_DB_USER.uid,
            canal: '01',
            telefonoOrigen: _req.CC.MT_DB_USER.userPhone,
            //Si se envió con un 0 al inicio lo eliminamos
            telefonoDestino: `58${_req.body.sendPhone?.charAt(0) == 0 ? _req.body.sendPhone.slice(1) : _req.body.sendPhone}`,
            bancoDestino: DB_BANK.code,
            cedulaDestino: `${DOCUMENT_TYPE}${_req.body.documentNumber}`,
            monto: String(_req.body.amount).replaceAll(/[.,]/g, ''),
            ipOrigen: _req.headers['x-forwarded-for'] || _req.socket.remoteAddress,
            concepto: _req.body.description,
          },
        };
      }

      // LLamado del API
      const RESPONSE = await structuringRequesttrdService(process.env.EXT_TRENDON_ORCH_API, '/bbu/orch', 'POST', parsedBody, null, null, _req.CC.refreshToken).catch((_error) => {
        throw new ErrorUtilClass(__filename, 'COPEE035').parseCatch(_error);
      });
      if (!RESPONSE.data[0]?.informacion) throw new ErrorUtilClass(__filename, 'COPEE036', null, 'Error realizado la transacción. Intente nuevamente más tarde').frontend();
      if (RESPONSE.data[0].informacion.codigo == 'P2P0009') throw new ErrorUtilClass(__filename, 'COPEE037', { amount: _req.body.amount, isAffiliated: true }, 'Monto mayor al permitido').frontend();
      if (RESPONSE.data[0].informacion.codigo == 'P2P1012') throw new ErrorUtilClass(__filename, 'COPEE038', { amount: _req.body.amount, isAffiliated: true }, 'Fondos insuficientes').frontend();
      if (RESPONSE.data[0].informacion.codigo == 'P2P0041' || RESPONSE.data[0].informacion.codigo == 'P2P0004')
        throw new ErrorUtilClass(__filename, 'COPEE068', { isAffiliated: false }, 'Usuario no se encuentra afiliado a pago móvil').frontend();
      if (RESPONSE.data[0].informacion.codigo != 'P2P0000')
        throw new ErrorUtilClass(
          __filename,
          'COPEE069',
          { isAffiliated: true },
          RESPONSE.data[0]?.informacion?.descripcion ? RESPONSE.data[0]?.informacion?.descripcion.replace(/\s*\./gm, '.') : 'El proveedor de servicio está presentando problemas'
        ).frontend();

      //Parseamos la fecha
      let parsedDate;
      if (RESPONSE.data[0].informacion.fechaPago) {
        parsedDate = `${RESPONSE.data[0].informacion.fechaPago.slice(4, 8)}-${RESPONSE.data[0].informacion.fechaPago.slice(2, 4)}-${RESPONSE.data[0].informacion.fechaPago.slice(0, 2)}`;
      }

      if (parsedDate && RESPONSE.data[0].informacion.horaPago) {
        parsedDate = `${parsedDate}T${RESPONSE.data[0].informacion.horaPago.slice(0, 2)}:${RESPONSE.data[0].informacion.horaPago.slice(2, 4)}:${RESPONSE.data[0].informacion.horaPago.slice(4, 6)}`;
      }
      const RESPONSE_PARSED = {
        authorizationIso: RESPONSE.data[0].informacion.autorizacionIso,
        tarceIso: RESPONSE.data[0].informacion.tarceIso,
        authorizationIbs: RESPONSE.data[0].informacion.autorizacionIbs,
        authorizationComissionIbs: RESPONSE.data[0].informacion.autorizacionComisionIbs,
        comission: await parsetrdNumberService(RESPONSE.data[0].informacion.comision, 12),
        paymentDate: parsedDate ? new Date(parsedDate) : RESPONSE.data[0].informacion.fechaPago,
        referenceNumber: RESPONSE.data[0].informacion.referencia,
        isAffiliated: true,
      };

			// Guardar notificación para el remitente
      const notificationDataSender = {
        monto: _req.body.amount,
        telefono: _req.body.sendPhone,
        referencia: RESPONSE.data[0].informacion.referencia,
				fecha_hora: new Date().toLocaleString()
      };
      const mensajeSender = generateNotificationMessage(MESSAGE_TYPE_NOTIFICATION.PAGO_MOVIL_REALIZADO, notificationDataSender);
      await saveNotification(_req.CC.MT_DB_USER.uid, MESSAGE_TYPE_NOTIFICATION.PAGO_MOVIL_REALIZADO, { ...notificationDataSender, mensaje: mensajeSender });

			console.log({ codigoBancoQueLlega: DB_BANK.code })
			if (String(DB_BANK.code) === 'trd') {
				// Guardar notificación para el destinatario
				const notificationDataReceiver = {
					monto: _req.body.amount,
					telefono: _req.CC.MT_DB_USER.userPhone,
					referencia: RESPONSE.data[0].informacion.referencia,
					fecha_hora: new Date().toLocaleString(),
				};
				const mensajeReceiver = generateNotificationMessage(MESSAGE_TYPE_NOTIFICATION.PAGO_MOVIL_RECIBIDO, notificationDataReceiver);
				await saveNotification(`${DOCUMENT_TYPE}${_req.body.documentNumber}`, MESSAGE_TYPE_NOTIFICATION.PAGO_MOVIL_RECIBIDO, { ...notificationDataReceiver, mensaje: mensajeReceiver });
			}
      
			// Respondemos solicitud
      return CC_RESPONSE.send(RESPONSE.data[0].informacion.descripcion.replace(/\s*\./gm, '.'), RESPONSE.data[0].informacion, 'COPES006', RESPONSE_PARSED);
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new ErrorUtilClass(__filename, 'COPEE040', _error).server() : _error);
    }
	},

};
