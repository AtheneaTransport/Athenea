import { Controller, Get, Post, Body, HttpStatus, HttpException, Res, UseGuards } from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { AppService } from './app.service';
import { Response } from 'express';
import { WebhookAuthGuard } from './guards/webhook-auth.guard';

@Controller()
@UseGuards(ThrottlerGuard)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Res() res: Response) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Nicolas Vehicle Management</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .container {
            background: rgba(255, 255, 255, 0.1);
            padding: 2rem;
            border-radius: 15px;
            backdrop-filter: blur(10px);
            text-align: center;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            max-width: 600px;
            width: 90%;
          }
          h1 {
            margin-bottom: 1rem;
            font-size: 2.5rem;
          }
          .subtitle {
            font-size: 1.2rem;
            margin-bottom: 2rem;
            opacity: 0.9;
          }
          .menu-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
            margin: 2rem 0;
          }
          .menu-item {
            background: rgba(255, 255, 255, 0.1);
            padding: 1.5rem;
            border-radius: 10px;
            border: 2px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
            text-decoration: none;
            color: white;
          }
          .menu-item:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
          }
          .menu-item h3 {
            margin: 0 0 0.5rem 0;
            font-size: 1.3rem;
          }
          .menu-item p {
            margin: 0;
            opacity: 0.8;
            font-size: 0.9rem;
          }
          .status-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 15px;
            font-size: 0.8rem;
            font-weight: bold;
            margin-top: 0.5rem;
          }
          .status-online {
            background: #4CAF50;
          }
          .status-offline {
            background: #f44336;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🤖 Nicolas Vehicle Management</h1>
          <p class="subtitle">Servidor de notificaciones para Airtable</p>
          
          <div class="menu-grid">
            <a href="/qr" class="menu-item">
              <h3>🔐 Conectar WhatsApp</h3>
              <p>Escanea el código QR para conectar tu WhatsApp</p>
            </a>
            
            <a href="/status" class="menu-item">
              <h3>📱 Estado del Servidor</h3>
              <p>Verifica el estado de conexión y configuración</p>
            </a>
            
            <a href="/manage" class="menu-item">
              <h3>⚙️ Gestión de WhatsApp</h3>
              <p>Conectar, desconectar y gestionar WhatsApp fácilmente</p>
            </a>
            
            <a href="/security" class="menu-item">
              <h3>🔒 Configuración de Seguridad</h3>
              <p>Palabra clave y configuración para Airtable</p>
            </a>
            
            <div class="menu-item" style="cursor: pointer;" onclick="showEndpoints()">
              <h3>📋 Endpoints API</h3>
              <p>Ver todos los endpoints disponibles</p>
            </div>
          </div>
          
          <div id="endpoints" style="display: none; margin-top: 2rem; background: rgba(0, 0, 0, 0.2); padding: 1rem; border-radius: 10px; text-align: left;">
            <h3>🔗 Endpoints Disponibles</h3>
            <div style="font-family: monospace; font-size: 0.9rem;">
              <div style="margin: 0.5rem 0; padding: 0.5rem; background: rgba(255, 255, 255, 0.1); border-radius: 5px;">
                <strong>GET /</strong> - Página principal
              </div>
              <div style="margin: 0.5rem 0; padding: 0.5rem; background: rgba(255, 255, 255, 0.1); border-radius: 5px;">
                <strong>GET /qr</strong> - Código QR para conectar WhatsApp
              </div>
              <div style="margin: 0.5rem 0; padding: 0.5rem; background: rgba(255, 255, 255, 0.1); border-radius: 5px;">
                <strong>GET /status</strong> - Estado de conexión
              </div>
              <div style="margin: 0.5rem 0; padding: 0.5rem; background: rgba(255, 255, 255, 0.1); border-radius: 5px;">
                <strong>POST /send-message</strong> - Enviar mensaje personalizado
              </div>
              <div style="margin: 0.5rem 0; padding: 0.5rem; background: rgba(255, 255, 255, 0.1); border-radius: 5px;">
                <strong>POST /webhook/airtable</strong> - Webhook para Airtable
              </div>
            </div>
          </div>
        </div>

        <script>
          function showEndpoints() {
            const endpoints = document.getElementById('endpoints');
            if (endpoints.style.display === 'none') {
              endpoints.style.display = 'block';
            } else {
              endpoints.style.display = 'none';
            }
          }
        </script>
      </body>
      </html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  }

  @Get('chats')
  async getChats() {
    try {
      const chats = await this.appService.getAllChats();
      return {
        success: true,
        chats: chats
      };
    } catch (error) {
      console.error('Error obteniendo chats:', error);
      throw new HttpException('Error obteniendo chats', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('groups')
  async getGroups() {
    try {
      const groups = await this.appService.getGroups();
      return {
        success: true,
        groups: groups,
        message: 'Para obtener el ID del grupo, envía un mensaje de prueba al grupo y luego consulta /test-message'
      };
    } catch (error) {
      console.error('Error obteniendo grupos:', error);
      throw new HttpException('Error obteniendo grupos', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('test-message')
  async getTestMessage() {
    return {
      success: true,
      message: 'Para obtener el ID del grupo:',
      instructions: [
        '1. Envía un mensaje de prueba al grupo desde WhatsApp',
        '2. El servidor detectará el mensaje y mostrará el ID del grupo',
        '3. Usa ese ID en la configuración'
      ],
      testEndpoint: 'POST /send-test-message'
    };
  }

  @Post('send-test-message')
  async sendTestMessage(@Body() body: { groupId: string }) {
    try {
      const { groupId } = body;
      
      if (!groupId) {
        throw new HttpException('groupId es requerido', HttpStatus.BAD_REQUEST);
      }

      const success = await this.appService.sendWhatsAppMessage(groupId, '🧪 Mensaje de prueba - Si recibes esto, el ID del grupo es correcto!');
      
      if (success) {
        return {
          success: true,
          message: 'Mensaje de prueba enviado exitosamente',
          groupId: groupId,
          note: 'Si recibiste el mensaje, este es el ID correcto del grupo'
        };
      } else {
        throw new HttpException('Error enviando mensaje de prueba', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } catch (error) {
      console.error('Error enviando mensaje de prueba:', error);
      throw new HttpException('Error interno del servidor', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('qr')
  async getQR(@Res() res: Response) {
    try {
      const qrImage = await this.appService.generateQRImage();
      const status = this.appService.getConnectionStatus();
      
      if (!qrImage) {
        // Si no hay QR, mostrar página de espera o estado conectado
        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>WhatsApp QR Code</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
              }
              .container {
                background: rgba(255, 255, 255, 0.1);
                padding: 2rem;
                border-radius: 15px;
                backdrop-filter: blur(10px);
                text-align: center;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                max-width: 500px;
                width: 90%;
              }
              h1 {
                margin-bottom: 1rem;
                font-size: 2rem;
              }
              .status-message {
                margin: 2rem 0;
                padding: 1.5rem;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                border: 2px solid rgba(255, 255, 255, 0.2);
              }
              .status-indicator {
                display: inline-block;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                margin-right: 10px;
              }
              .connected {
                background: #4CAF50;
                box-shadow: 0 0 10px #4CAF50;
              }
              .waiting {
                background: #FF9800;
                box-shadow: 0 0 10px #FF9800;
                animation: pulse 2s infinite;
              }
              @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
              }
              .buttons {
                margin-top: 2rem;
                display: flex;
                gap: 1rem;
                justify-content: center;
                flex-wrap: wrap;
              }
              .btn {
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 25px;
                background: rgba(255, 255, 255, 0.2);
                color: white;
                text-decoration: none;
                font-weight: bold;
                transition: all 0.3s ease;
                cursor: pointer;
              }
              .btn:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: translateY(-2px);
              }
              .btn-primary {
                background: linear-gradient(45deg, #4CAF50, #45a049);
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🔐 Nicolas Vehicle Management - QR Code</h1>
              
              <div class="status-message">
                ${status.isConnected ? 
                  `<span class="status-indicator connected"></span>
                   <strong>¡WhatsApp ya está conectado!</strong>
                   <p>No necesitas escanear ningún código QR.</p>` :
                  `<span class="status-indicator waiting"></span>
                   <strong>Esperando código QR...</strong>
                   <p>El código QR aparecerá automáticamente cuando esté disponible.</p>`
                }
              </div>

              <div class="buttons">
                <a href="/status" class="btn btn-primary">📱 Ver Estado</a>
                <button onclick="location.reload()" class="btn">🔄 Actualizar</button>
              </div>
            </div>

            <script>
              // Auto-refresh cada 3 segundos si no está conectado
              ${!status.isConnected ? `
                setTimeout(() => {
                  location.reload();
                }, 3000);
              ` : ''}
            </script>
          </body>
          </html>
        `;
        
        res.setHeader('Content-Type', 'text/html');
        return res.send(html);
      }

      // Crear una página HTML con el código QR
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>WhatsApp QR Code</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .container {
              background: rgba(255, 255, 255, 0.1);
              padding: 2rem;
              border-radius: 15px;
              backdrop-filter: blur(10px);
              text-align: center;
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            }
            h1 {
              margin-bottom: 1rem;
              font-size: 2rem;
            }
            .qr-code {
              margin: 2rem 0;
              padding: 1rem;
              background: white;
              border-radius: 10px;
              box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
            }
            .instructions {
              margin-top: 1rem;
              font-size: 1.1rem;
              line-height: 1.6;
            }
            .status {
              margin-top: 1rem;
              padding: 0.5rem 1rem;
              background: rgba(255, 255, 255, 0.2);
              border-radius: 5px;
              font-size: 0.9rem;
            }
            .buttons {
              margin-top: 2rem;
              display: flex;
              gap: 1rem;
              justify-content: center;
              flex-wrap: wrap;
            }
            .btn {
              padding: 0.75rem 1.5rem;
              border: none;
              border-radius: 25px;
              background: rgba(255, 255, 255, 0.2);
              color: white;
              text-decoration: none;
              font-weight: bold;
              transition: all 0.3s ease;
              cursor: pointer;
            }
            .btn:hover {
              background: rgba(255, 255, 255, 0.3);
              transform: translateY(-2px);
            }
            .btn-primary {
              background: linear-gradient(45deg, #4CAF50, #45a049);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🔐 Conectar WhatsApp</h1>
            <div class="qr-code">
              <img src="${qrImage}" alt="WhatsApp QR Code" style="max-width: 300px; height: auto;">
            </div>
            <div class="instructions">
              <p><strong>Instrucciones:</strong></p>
              <ol style="text-align: left; max-width: 400px; margin: 0 auto;">
                <li>Abre WhatsApp en tu teléfono</li>
                <li>Ve a Configuración > Dispositivos vinculados</li>
                <li>Escanea este código QR</li>
                <li>Espera a que se conecte automáticamente</li>
              </ol>
            </div>
            <div class="status">
              Estado: Esperando conexión...
            </div>
            
            <div class="buttons" style="margin-top: 2rem;">
              <a href="/status" class="btn btn-primary">📱 Ver Estado</a>
            </div>
          </div>
          <script>
            // Verificar estado cada 2 segundos
            setInterval(async () => {
              try {
                const response = await fetch('/qr');
                const data = await response.json();
                if (data.isConnected) {
                  document.querySelector('.status').innerHTML = '✅ Estado: ¡Conectado exitosamente!';
                  document.querySelector('.status').style.background = 'rgba(76, 175, 80, 0.3)';
                }
              } catch (error) {
                console.log('Verificando estado...');
              }
            }, 2000);
          </script>
        </body>
        </html>
      `;

      res.setHeader('Content-Type', 'text/html');
      return res.send(html);
    } catch (error) {
      console.error('Error generando QR:', error);
      throw new HttpException('Error generando código QR', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('restart')
  async restartConnection() {
    try {
      await this.appService.restartConnection();
      return {
        success: true,
        message: 'Reiniciando conexión de WhatsApp... Los datos de autenticación han sido limpiados.'
      };
    } catch (error) {
      console.error('Error reiniciando conexión:', error);
      throw new HttpException('Error reiniciando conexión', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('security')
  async getSecurityInfo(@Res() res: Response) {
    try {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Configuración de Seguridad</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .container {
              background: rgba(255, 255, 255, 0.1);
              padding: 2rem;
              border-radius: 15px;
              backdrop-filter: blur(10px);
              text-align: center;
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
              max-width: 800px;
              width: 90%;
            }
            h1 {
              margin-bottom: 1rem;
              font-size: 2rem;
            }
            .info-card {
              margin: 2rem 0;
              padding: 1.5rem;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 10px;
              border: 2px solid rgba(255, 255, 255, 0.2);
              text-align: left;
            }
            .code-block {
              background: rgba(0, 0, 0, 0.3);
              padding: 1rem;
              border-radius: 5px;
              font-family: monospace;
              margin: 1rem 0;
              word-break: break-all;
            }
            .btn {
              padding: 0.75rem 1.5rem;
              border: none;
              border-radius: 25px;
              background: rgba(255, 255, 255, 0.2);
              color: white;
              text-decoration: none;
              font-weight: bold;
              transition: all 0.3s ease;
              cursor: pointer;
              margin: 0.5rem;
              display: inline-block;
            }
            .btn:hover {
              background: rgba(255, 255, 255, 0.3);
              transform: translateY(-2px);
            }
            .warning {
              background: rgba(255, 152, 0, 0.2);
              border: 2px solid rgba(255, 152, 0, 0.5);
              padding: 1rem;
              border-radius: 10px;
              margin: 1rem 0;
            }
            .success {
              background: rgba(76, 175, 80, 0.2);
              border: 2px solid rgba(76, 175, 80, 0.5);
              padding: 1rem;
              border-radius: 10px;
              margin: 1rem 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🔒 Configuración de Seguridad</h1>
            
            <div class="success">
              <h3>✅ Seguridad Activada</h3>
              <p>El servidor está protegido con Helmet y Throttling</p>
            </div>

            <div class="info-card">
              <h3>🔑 Palabra Clave Secreta</h3>
              <p>Para usar el webhook de Airtable, incluye este header:</p>
              <div class="code-block">
                <strong>Header:</strong> X-Webhook-Secret<br>
                <strong>Valor:</strong> nicolas-vehicle-secure-2024
              </div>
            </div>

            <div class="info-card">
              <h3>🌐 URL del Webhook</h3>
              <p>Configura este endpoint en Airtable:</p>
              <div class="code-block">
                POST /webhook/airtable
              </div>
              <p>Ejemplo completo con ngrok:</p>
              <div class="code-block">
                https://tu-url-ngrok.ngrok.io/webhook/airtable
              </div>
            </div>

            <div class="info-card">
              <h3>📝 Ejemplo de Configuración en Airtable</h3>
              <p>1. Ve a Automations en Airtable</p>
              <p>2. Agrega un trigger "When record matches conditions"</p>
              <p>3. Configura la condición: estado = "revisado"</p>
              <p>4. Agrega acción "Send a webhook"</p>
              <p>5. Configura los headers:</p>
              <div class="code-block">
                Content-Type: application/json<br>
                X-Webhook-Secret: nicolas-vehicle-secure-2024
              </div>
            </div>

            <div class="info-card">
              <h3>🧪 Probar el Webhook</h3>
              <p>Puedes probar desde terminal o Insomnia:</p>
              <div class="code-block">
curl -X POST http://localhost:3000/webhook/airtable \\<br>
  -H "Content-Type: application/json" \\<br>
  -H "X-Webhook-Secret: nicolas-vehicle-secure-2024" \\<br>
  -d '{"estado": "revisado", "documento": "TEST-001"}'
              </div>
            </div>

            <div class="warning">
              <h3>⚠️ Importante</h3>
              <ul>
                <li>Sin el header correcto, el webhook será rechazado</li>
                <li>El servidor tiene límite de 30 requests por minuto para webhooks</li>
                <li>Puedes cambiar la palabra clave en las variables de entorno</li>
              </ul>
            </div>

            <div style="margin-top: 2rem;">
              <a href="/" class="btn">🏠 Volver al Inicio</a>
              <a href="/manage" class="btn">⚙️ Gestión</a>
            </div>
          </div>
        </body>
        </html>
      `;
      
      res.setHeader('Content-Type', 'text/html');
      return res.send(html);
    } catch (error) {
      console.error('Error obteniendo información de seguridad:', error);
      throw new HttpException('Error obteniendo información de seguridad', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('manage')
  async getManagementPage(@Res() res: Response) {
    try {
      const status = this.appService.getConnectionStatus();
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Gestión de WhatsApp</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .container {
              background: rgba(255, 255, 255, 0.1);
              padding: 2rem;
              border-radius: 15px;
              backdrop-filter: blur(10px);
              text-align: center;
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
              max-width: 600px;
              width: 90%;
            }
            h1 {
              margin-bottom: 1rem;
              font-size: 2rem;
            }
            .status-card {
              margin: 2rem 0;
              padding: 1.5rem;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 10px;
              border: 2px solid rgba(255, 255, 255, 0.2);
            }
            .status-indicator {
              display: inline-block;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              margin-right: 10px;
            }
            .connected {
              background: #4CAF50;
              box-shadow: 0 0 10px #4CAF50;
            }
            .disconnected {
              background: #f44336;
              box-shadow: 0 0 10px #f44336;
            }
            .action-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 1rem;
              margin: 2rem 0;
            }
            .action-card {
              background: rgba(255, 255, 255, 0.1);
              padding: 1.5rem;
              border-radius: 10px;
              border: 2px solid rgba(255, 255, 255, 0.2);
              transition: all 0.3s ease;
            }
            .action-card:hover {
              background: rgba(255, 255, 255, 0.2);
              transform: translateY(-2px);
            }
            .btn {
              padding: 0.75rem 1.5rem;
              border: none;
              border-radius: 25px;
              background: rgba(255, 255, 255, 0.2);
              color: white;
              text-decoration: none;
              font-weight: bold;
              transition: all 0.3s ease;
              cursor: pointer;
              margin: 0.5rem;
              display: inline-block;
            }
            .btn:hover {
              background: rgba(255, 255, 255, 0.3);
              transform: translateY(-2px);
            }
            .btn-danger {
              background: linear-gradient(45deg, #f44336, #d32f2f);
            }
            .btn-warning {
              background: linear-gradient(45deg, #FF9800, #F57C00);
            }
            .btn-success {
              background: linear-gradient(45deg, #4CAF50, #45a049);
            }
            .btn-info {
              background: linear-gradient(45deg, #2196F3, #1976D2);
            }
            .instructions {
              margin-top: 2rem;
              background: rgba(0, 0, 0, 0.2);
              padding: 1rem;
              border-radius: 10px;
              text-align: left;
            }
            .instructions h3 {
              margin-top: 0;
            }
            .instructions ol {
              margin: 0.5rem 0;
              padding-left: 1.5rem;
            }
            .instructions li {
              margin: 0.5rem 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>⚙️ Gestión de WhatsApp</h1>
            
            <div class="status-card">
              <h2>Estado Actual</h2>
              <div style="margin: 1rem 0;">
                <span class="status-indicator ${status.isConnected ? 'connected' : 'disconnected'}"></span>
                <strong>WhatsApp:</strong> ${status.isConnected ? 'Conectado' : 'Desconectado'}
              </div>
            </div>

            <div class="action-grid">
              <div class="action-card">
                <h3>🔐 Conectar</h3>
                <p>Conectar WhatsApp al servidor</p>
                <a href="/qr" class="btn btn-success">Ir al Código QR</a>
              </div>
              
              <div class="action-card">
                <h3>🔄 Reiniciar</h3>
                <p>Reiniciar la conexión de WhatsApp</p>
                <button onclick="restartConnection()" class="btn btn-warning">Reiniciar Conexión</button>
              </div>
              
              <div class="action-card">
                <h3>📱 Estado</h3>
                <p>Ver estado detallado del servidor</p>
                <a href="/status" class="btn btn-info">Ver Estado</a>
              </div>
              
              <div class="action-card">
                <h3>🧪 Probar</h3>
                <p>Enviar mensaje de prueba</p>
                <button onclick="testMessage()" class="btn btn-info">Probar Mensaje</button>
              </div>
            </div>

            <div class="instructions">
              <h3>📋 Instrucciones para Usuarios</h3>
              <ol>
                <li><strong>Para conectar:</strong> Haz clic en "Ir al Código QR" y escanea con WhatsApp</li>
                <li><strong>Para desconectar:</strong> Ve a WhatsApp → Configuración → Dispositivos vinculados → Cerrar sesión</li>
                <li><strong>Si hay problemas:</strong> Usa "Reiniciar Conexión" y vuelve a escanear</li>
                <li><strong>Para probar:</strong> Usa "Probar Mensaje" para verificar que funciona</li>
              </ol>
            </div>

            <div style="margin-top: 2rem;">
              <a href="/" class="btn">🏠 Volver al Inicio</a>
            </div>
          </div>

                     <script>
             function restartConnection() {
               if (confirm('¿Estás seguro de que quieres reiniciar la conexión de WhatsApp?\\n\\nEsto cerrará la sesión actual y limpiará todos los datos de autenticación.')) {
                 fetch('/restart')
                   .then(response => response.json())
                   .then(data => {
                     alert('✅ Reiniciando conexión...\\n\\n🔄 Los datos de autenticación han sido limpiados\\n⏳ Espera 3 segundos y ve a /qr para escanear el nuevo código QR.');
                     setTimeout(() => {
                       window.location.href = '/qr';
                     }, 4000);
                   })
                   .catch(error => {
                     console.error('Error reiniciando conexión:', error);
                     alert('❌ Error reiniciando conexión');
                   });
               }
             }

             function testMessage() {
              const groupId = prompt('Ingresa el ID del grupo (ejemplo: 1234567890@g.us):');
              if (groupId) {
                fetch('/send-test-message', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ groupId: groupId })
                })
                .then(response => response.json())
                .then(data => {
                  if (data.success) {
                    alert('✅ Mensaje de prueba enviado exitosamente!');
                  } else {
                    alert('❌ Error enviando mensaje: ' + data.message);
                  }
                })
                .catch(error => {
                  console.error('Error:', error);
                  alert('❌ Error enviando mensaje');
                });
              }
            }

            // Auto-refresh cada 5 segundos
            setInterval(() => {
              location.reload();
            }, 5000);
          </script>
        </body>
        </html>
      `;
      
      res.setHeader('Content-Type', 'text/html');
      return res.send(html);
    } catch (error) {
      console.error('Error obteniendo página de gestión:', error);
      throw new HttpException('Error obteniendo página de gestión', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('status')
  async getStatus(@Res() res: Response) {
    try {
      const status = this.appService.getConnectionStatus();
      
      // Crear página HTML para el status
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Nicolas Vehicle Management - Status</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .container {
              background: rgba(255, 255, 255, 0.1);
              padding: 2rem;
              border-radius: 15px;
              backdrop-filter: blur(10px);
              text-align: center;
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
              max-width: 500px;
              width: 90%;
            }
            h1 {
              margin-bottom: 1rem;
              font-size: 2rem;
            }
            .status-card {
              margin: 2rem 0;
              padding: 1.5rem;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 10px;
              border: 2px solid rgba(255, 255, 255, 0.2);
            }
            .status-indicator {
              display: inline-block;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              margin-right: 10px;
            }
            .connected {
              background: #4CAF50;
              box-shadow: 0 0 10px #4CAF50;
            }
            .disconnected {
              background: #f44336;
              box-shadow: 0 0 10px #f44336;
            }
            .qr-available {
              background: #FF9800;
              box-shadow: 0 0 10px #FF9800;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 1rem;
              margin: 1rem 0;
              text-align: left;
            }
            .info-item {
              background: rgba(255, 255, 255, 0.1);
              padding: 0.5rem;
              border-radius: 5px;
            }
            .buttons {
              margin-top: 2rem;
              display: flex;
              gap: 1rem;
              justify-content: center;
              flex-wrap: wrap;
            }
            .btn {
              padding: 0.75rem 1.5rem;
              border: none;
              border-radius: 25px;
              background: rgba(255, 255, 255, 0.2);
              color: white;
              text-decoration: none;
              font-weight: bold;
              transition: all 0.3s ease;
              cursor: pointer;
            }
            .btn:hover {
              background: rgba(255, 255, 255, 0.3);
              transform: translateY(-2px);
            }
            .btn-primary {
              background: linear-gradient(45deg, #4CAF50, #45a049);
            }
            .btn-warning {
              background: linear-gradient(45deg, #FF9800, #F57C00);
            }
            .endpoints {
              margin-top: 2rem;
              background: rgba(0, 0, 0, 0.2);
              padding: 1rem;
              border-radius: 10px;
              text-align: left;
            }
            .endpoint {
              margin: 0.5rem 0;
              font-family: monospace;
              background: rgba(255, 255, 255, 0.1);
              padding: 0.5rem;
              border-radius: 5px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>📱 WhatsApp Status</h1>
            
            <div class="status-card">
              <h2>Estado de Conexión</h2>
              <div class="info-grid">
                <div class="info-item">
                  <span class="status-indicator ${status.isConnected ? 'connected' : 'disconnected'}"></span>
                  <strong>Conexión:</strong> ${status.isConnected ? 'Conectado' : 'Desconectado'}
                </div>
                <div class="info-item">
                  <span class="status-indicator ${status.hasQR ? 'qr-available' : 'disconnected'}"></span>
                  <strong>QR:</strong> ${status.hasQR ? 'Disponible' : 'No disponible'}
                </div>
              </div>
            </div>

            <div class="buttons">
              <a href="/qr" class="btn btn-warning">🔐 Conectar WhatsApp</a>
              <button onclick="refreshStatus()" class="btn">🔄 Actualizar</button>
              <button onclick="restartConnection()" class="btn" style="background: linear-gradient(45deg, #f44336, #d32f2f);">🔄 Reiniciar Conexión</button>
            </div>

            <div class="endpoints">
              <h3>📋 Endpoints Disponibles</h3>
              <div class="endpoint">GET /status - Estado de conexión</div>
              <div class="endpoint">GET /qr - Código QR para conectar</div>
              <div class="endpoint">POST /send-message - Enviar mensaje personalizado</div>
              <div class="endpoint">POST /webhook/airtable - Webhook para Airtable</div>
            </div>
          </div>

          <script>
            function refreshStatus() {
              location.reload();
            }

            function restartConnection() {
              if (confirm('¿Estás seguro de que quieres reiniciar la conexión de WhatsApp?')) {
                fetch('/restart')
                  .then(response => response.json())
                  .then(data => {
                    alert('Reiniciando conexión... Ve a /qr para escanear el nuevo código QR.');
                    setTimeout(() => {
                      window.location.href = '/qr';
                    }, 2000);
                  })
                  .catch(error => {
                    console.error('Error reiniciando conexión:', error);
                    alert('Error reiniciando conexión');
                  });
              }
            }

            // Función para actualizar el estado en tiempo real
            function updateStatus() {
              fetch('/status')
                .then(response => response.json())
                .then(data => {
                  const statusIndicators = document.querySelectorAll('.status-indicator');
                  const statusTexts = document.querySelectorAll('.info-item strong');
                  
                  // Actualizar indicador de conexión
                  if (data.isConnected) {
                    statusIndicators[0].className = 'status-indicator connected';
                    statusTexts[0].nextSibling.textContent = 'Conectado';
                  } else {
                    statusIndicators[0].className = 'status-indicator disconnected';
                    statusTexts[0].nextSibling.textContent = 'Desconectado';
                  }
                  
                  // Actualizar indicador de QR
                  if (data.hasQR) {
                    statusIndicators[1].className = 'status-indicator qr-available';
                    statusTexts[1].nextSibling.textContent = 'Disponible';
                  } else {
                    statusIndicators[1].className = 'status-indicator disconnected';
                    statusTexts[1].nextSibling.textContent = 'No disponible';
                  }
                })
                .catch(error => console.log('Error actualizando estado'));
            }

            // Auto-refresh cada 2 segundos
            setInterval(updateStatus, 2000);
            
            // Actualizar inmediatamente
            updateStatus();
          </script>
        </body>
        </html>
      `;

      res.setHeader('Content-Type', 'text/html');
      return res.send(html);
    } catch (error) {
      console.error('Error obteniendo estado:', error);
      throw new HttpException('Error obteniendo estado', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('webhook/airtable')
  @UseGuards(WebhookAuthGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } }) // 30 requests por minuto para webhooks
  async handleAirtableWebhook(@Body() data: any) {
    try {
      console.log('Webhook recibido de Airtable:', data);
      
      // Verificar si el estado es "revisado"
      if (data.estado === 'revisado' || data.fields?.estado === 'revisado') {
        const success = await this.appService.handleVehicleStatusUpdate(data);
        
        if (success) {
          return {
            success: true,
            message: 'Mensaje enviado exitosamente a WhatsApp'
          };
        } else {
          throw new HttpException('Error enviando mensaje a WhatsApp', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      } else {
        return {
          success: true,
          message: 'Estado no es "revisado", no se envía mensaje'
        };
      }
    } catch (error) {
      console.error('Error procesando webhook:', error);
      throw new HttpException('Error interno del servidor', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('send-message')
  async sendCustomMessage(@Body() body: { groupId: string; message: string }) {
    try {
      const { groupId, message } = body;
      
      if (!groupId || !message) {
        throw new HttpException('groupId y message son requeridos', HttpStatus.BAD_REQUEST);
      }

      const success = await this.appService.sendWhatsAppMessage(groupId, message);
      
      if (success) {
        return {
          success: true,
          message: 'Mensaje enviado exitosamente'
        };
      } else {
        throw new HttpException('Error enviando mensaje', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } catch (error) {
      console.error('Error enviando mensaje personalizado:', error);
      throw new HttpException('Error interno del servidor', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
