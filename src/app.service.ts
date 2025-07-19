import { Injectable } from '@nestjs/common';
import { makeWASocket, DisconnectReason, useMultiFileAuthState, WASocket } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import * as fs from 'fs';
import * as path from 'path';
import { whatsappConfig } from './config/whatsapp.config';
import * as QRCode from 'qrcode';

@Injectable()
export class AppService {
  private sock: WASocket;
  private isConnected = false;
  private currentQR: string = '';

  constructor() {
    this.initializeWhatsApp();
  }

  getHello(): string {
    return 'Hello World!';
  }

  private async initializeWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState(whatsappConfig.baileys.authPath);
    
    this.sock = makeWASocket({
      auth: state,
    });

    this.sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        this.currentQR = qr;
        console.log('🔐 Código QR generado. Visita: http://localhost:3000/qr');
      }
      
      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log('Conexión cerrada debido a ', lastDisconnect?.error, ', reconectando ', shouldReconnect);
        
        // Actualizar estado de conexión
        this.isConnected = false;
        this.currentQR = ''; // Limpiar QR cuando se desconecta
        
        if (shouldReconnect) {
          this.initializeWhatsApp();
        }
      } else if (connection === 'open') {
        console.log(whatsappConfig.messages.connectionSuccess);
        this.isConnected = true;
        this.currentQR = ''; // Limpiar QR cuando se conecta
        
        // Listar todos los grupos al conectarse
        setTimeout(async () => {
          try {
            const groups = await this.getGroups();
            console.log('📱 Grupos disponibles:');
            groups.forEach(group => {
              console.log(`- ${group.name}: ${group.id}`);
            });
          } catch (error) {
            console.log('No se pudieron obtener los grupos:', error.message);
          }
        }, 2000);
      }
    });

    this.sock.ev.on('creds.update', saveCreds);

    // Escuchar mensajes para detectar grupos
    this.sock.ev.on('messages.upsert', async (m) => {
      const msg = m.messages[0];
      if (msg.key.fromMe) return; // Ignorar mensajes propios
      
      const chatId = msg.key.remoteJid;
      if (chatId && chatId.includes('@g.us')) {
        console.log('📱 Grupo detectado:', chatId);
        console.log('💡 Para usar este grupo, copia este ID:', chatId);
      }
    });
  }

  async sendWhatsAppMessage(groupId: string, message: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        console.log('WhatsApp no está conectado');
        return false;
      }

      await this.sock.sendMessage(groupId, { text: message });
      console.log(whatsappConfig.messages.messageSent);
      return true;
    } catch (error) {
      console.error(whatsappConfig.messages.messageError, error);
      return false;
    }
  }

  async handleVehicleStatusUpdate(data: any): Promise<boolean> {
    try {
      // Formatear el mensaje basado en los datos de Airtable
      const message = whatsappConfig.messages.vehicleStatusUpdate(data);
      
      return await this.sendWhatsAppMessage(whatsappConfig.groupId, message);
    } catch (error) {
      console.error('Error procesando actualización de estado:', error);
      return false;
    }
  }

  async getAllChats(): Promise<any[]> {
    try {
      if (!this.isConnected || !this.sock) {
        throw new Error('WhatsApp no está conectado');
      }

      // Método alternativo: usar el evento de conexión para obtener chats
      console.log('Método getAllChats no disponible en esta versión de Baileys');
      return [];
    } catch (error) {
      console.error('Error obteniendo chats:', error);
      throw error;
    }
  }

  async getGroups(): Promise<any[]> {
    try {
      if (!this.isConnected || !this.sock) {
        throw new Error('WhatsApp no está conectado');
      }

      // Método alternativo: usar el evento de conexión para obtener grupos
      console.log('Método getGroups no disponible en esta versión de Baileys');
      return [];
    } catch (error) {
      console.error('Error obteniendo grupos:', error);
      throw error;
    }
  }

  async generateQRImage(): Promise<string | null> {
    try {
      if (!this.currentQR) {
        return null;
      }

      const qrImage = await QRCode.toDataURL(this.currentQR, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      return qrImage;
    } catch (error) {
      console.error('Error generando código QR:', error);
      return null;
    }
  }

  getConnectionStatus(): { isConnected: boolean; hasQR: boolean } {
    return {
      isConnected: this.isConnected,
      hasQR: !!this.currentQR
    };
  }

  async restartConnection(): Promise<void> {
    try {
      console.log('🔄 Reiniciando conexión de WhatsApp...');
      
      // Limpiar estado actual
      this.isConnected = false;
      this.currentQR = '';
      
      // Cerrar conexión actual si existe
      if (this.sock) {
        try {
          await this.sock.logout();
        } catch (error) {
          console.log('No se pudo cerrar la conexión anterior:', error.message);
        }
      }
      
      // Limpiar datos de autenticación
      try {
        const fs = require('fs');
        const path = require('path');
        const authPath = path.join(process.cwd(), 'auth_info_baileys');
        
        if (fs.existsSync(authPath)) {
          fs.rmSync(authPath, { recursive: true, force: true });
          console.log('✅ Datos de autenticación limpiados');
        }
      } catch (error) {
        console.log('No se pudieron limpiar los datos de autenticación:', error.message);
      }
      
      // Reinicializar después de un delay más largo
      setTimeout(() => {
        console.log('🔄 Iniciando nueva conexión...');
        this.initializeWhatsApp();
      }, 3000);
      
    } catch (error) {
      console.error('Error reiniciando conexión:', error);
    }
  }
}
