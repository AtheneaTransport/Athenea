export const whatsappConfig = {
  // ID del grupo de WhatsApp (reemplaza con tu ID real)
  groupId: process.env.WHATSAPP_GROUP_ID || '120363028147961861@g.us',
  
  // Configuración de Baileys
  baileys: {
    authPath: 'auth_info_baileys',
    printQR: true,
  },
  
  // Mensajes predefinidos
  messages: {
    // Check List
    checkList: (data: any) => `📋 *Check-List*

 *Placa:* ${data.placa || 'N/A'}
 *Observación del camión:* ${data.observacionCamion || 'N/A'}
 *Reefer/Cisterna:* ${data.reeferCisterna || 'N/A'}
 *Observaciones del trailer:* ${data.observacionesTrailer || 'N/A'}`,

    // Reporte de Correctivos Diarios
    reporteCorrectivos: (data: any) => `🔧 *Reporte de Correctivos Diarios*

 *Fecha de Inicio de Ejecución:* ${data.fechaInicio || 'N/A'}
 *Placa Tractors / Componentes:* ${data.placaTractor + " / " + data.components || 'N/A'}
 *Placa Semi-Remolque / Componentes:* ${data.placaSemiRemolque + " / " + data.semiRemolqueComponents || 'N/A'}
 *Descripción del Servicio:* ${data.descripcionServicio || 'N/A'}
 *Costo:* ${data.costo || 'N/A'}`,

    // Documentos Legales
    documentosLegales: (data: any) => `📄 *Documentos Legales*

⚠️ Un documento de la placa: *"${data.placa || 'N/A'}"* esta por vencer en 7 días, adquirir el nuevo hoy mismo.

 *Revisión Técnica:* ${data.revisionTecnica || 'N/A'}
 *SOAT:* ${data.soat || 'N/A'}
 *Tarjeta de Mercancías:* ${data.tarjetaMercancias || 'N/A'}`,

    // Mensaje genérico para webhook de Airtable
    vehicleStatusUpdate: (data: any) => `🚗 *Actualización de Vehículo*

 *Documento:* ${data.documento || 'N/A'}
 *Vehículo:* ${data.vehiculo || 'N/A'}
 *Estado:* ${data.estado || 'N/A'}
 *Revisado por:* ${data.revisadoPor || 'N/A'}
 *Fecha:* ${new Date().toLocaleString('es-ES')}

El documento ha sido revisado y aprobado.`,
    
    connectionSuccess: '✅ WhatsApp conectado exitosamente',
    connectionError: '❌ Error conectando a WhatsApp',
    messageSent: '✅ Mensaje enviado exitosamente',
    messageError: '❌ Error enviando mensaje',
  }
}; 