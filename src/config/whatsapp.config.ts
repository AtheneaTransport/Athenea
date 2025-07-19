export const whatsappConfig = {
  // ID del grupo de WhatsApp (reemplaza con tu ID real)
  groupId: process.env.WHATSAPP_GROUP_ID || '120363402340131002@g.us',
  
  // Configuración de Baileys
  baileys: {
    authPath: 'auth_info_baileys',
    printQR: true,
  },
  
  // Mensajes predefinidos
  messages: {
    vehicleStatusUpdate: (data: any) => `🚗 *Actualización de Vehículo*

📋 *Documento:* ${data.documento || 'N/A'}
🚙 *Vehículo:* ${data.vehiculo || 'N/A'}
✅ *Estado:* ${data.estado || 'N/A'}
👤 *Revisado por:* ${data.revisadoPor || 'N/A'}
📅 *Fecha:* ${new Date().toLocaleString('es-ES')}

El documento ha sido revisado y aprobado.`,
    
    connectionSuccess: '✅ WhatsApp conectado exitosamente',
    connectionError: '❌ Error conectando a WhatsApp',
    messageSent: '✅ Mensaje enviado exitosamente',
    messageError: '❌ Error enviando mensaje',
  }
}; 