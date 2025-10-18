export const whatsappConfig = {
  // ID del grupo de WhatsApp (reemplaza con tu ID real)
  groupId: process.env.WHATSAPP_GROUP_ID || '120363401785478853@g.us',
  
  // Configuración de Baileys
  baileys: {
    authPath: 'auth_info_baileys',
    printQR: true,
  },
  
  // Mensajes predefinidos
  messages: {
    // Check List
    checkList: (data: any) => {
      try {
        return `📋 *Check-List*

• *Placa:* ${data.placa || 'N/A'}
• *Observación del camión:* ${data.observacionCamion || 'N/A'}
• *Reefer/Cisterna:* ${data.reeferCisterna || 'N/A'}
• *Observaciones del trailer:* ${data.observacionesTrailer || 'N/A'}`;
      } catch (error) {
        console.error('Error generando mensaje checkList:', error);
        return '📋 *Check-List* - Error al generar mensaje';
      }
    },

    // Reporte de Correctivos Diarios
    reporteCorrectivos: (data: any) => {
      try {
        const placaTractor = data.placaTractor || 'N/A';
        const components = data.components || 'N/A';
        const placaSemiRemolque = data.placaSemiRemolque || 'N/A';
        const semiRemolqueComponents = data.semiRemolqueComponents || 'N/A';
        
        return `🔧 *Reporte de Correctivos Diarios*

• *Fecha de Inicio de Ejecución:* ${data.fechaInicio || 'N/A'}
• *Placa Tractors / Componentes:* ${placaTractor} / ${components}
• *Placa Semi-Remolque / Componentes:* ${placaSemiRemolque} / ${semiRemolqueComponents}
• *Descripción del Servicio:* ${data.descripcionServicio || 'N/A'}
• *Costo:* ${data.costo || 'N/A'}`;
      } catch (error) {
        console.error('Error generando mensaje reporteCorrectivos:', error);
        return '🔧 *Reporte de Correctivos Diarios* - Error al generar mensaje';
      }
    },

    // Documentos Legales
    documentosLegales: (data: any) => {
      try {
        return `📄 *Documentos Legales*

⚠️ Un documento de la placa: *"${data.placa || 'N/A'}"* está por vencer en 7 días, adquirir el nuevo hoy mismo.

• *Revisión Técnica:* ${data.revisionTecnica || 'N/A'}
• *SOAT:* ${data.soat || 'N/A'}
• *Tarjeta de Mercancías:* ${data.tarjetaMercancias || 'N/A'}`;
      } catch (error) {
        console.error('Error generando mensaje documentosLegales:', error);
        return '📄 *Documentos Legales* - Error al generar mensaje';
      }
    },

    // Mensaje genérico para webhook de Airtable
    vehicleStatusUpdate: (data: any) => {
      try {
        return `🚗 *Actualización de Vehículo*

• *Documento:* ${data.documento || 'N/A'}
• *Vehículo:* ${data.vehiculo || 'N/A'}
• *Estado:* ${data.estado || 'N/A'}
• *Revisado por:* ${data.revisadoPor || 'N/A'}
• *Fecha:* ${new Date().toLocaleString('es-ES')}

El documento ha sido revisado y aprobado.`;
      } catch (error) {
        console.error('Error generando mensaje vehicleStatusUpdate:', error);
        return '🚗 *Actualización de Vehículo* - Error al generar mensaje';
      }
    },
    
    connectionSuccess: '✅ WhatsApp conectado exitosamente',
    connectionError: '❌ Error conectando a WhatsApp',
    messageSent: '✅ Mensaje enviado exitosamente',
    messageError: '❌ Error enviando mensaje',
  }
};