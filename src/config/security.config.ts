export const securityConfig = {
  // Palabra clave secreta para los webhooks
  webhookSecret: process.env.WEBHOOK_SECRET || 'nicolas-vehicle-secure-2024',
  
  // Headers de autenticación
  authHeaders: {
    secret: 'X-Webhook-Secret',
    timestamp: 'X-Webhook-Timestamp'
  },
  
  // Configuración de throttling
  throttle: {
    ttl: 60000, // 1 minuto
    limit: 10,  // 10 requests por minuto
    webhookLimit: 30 // 30 requests por minuto para webhooks
  }
}; 