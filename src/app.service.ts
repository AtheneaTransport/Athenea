
import { Injectable } from '@nestjs/common';
import { makeWASocket, DisconnectReason, useMultiFileAuthState, WASocket } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import * as fs from 'fs';
import * as path from 'path';
import { whatsappConfig } from './config/whatsapp.config';
import * as QRCode from 'qrcode';
import axios from 'axios';

@Injectable()
export class AppService {
  private sock: WASocket;
  private isConnected = false;
  private currentQR: string = '';

  constructor() {
    this.initializeWhatsApp();
  }

  private async initializeWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState(whatsappConfig.baileys.authPath);
    this.sock = makeWASocket({
      auth: state,
      printQRInTerminal: true,
      browser: ['Ubuntu', 'Chrome', '22.04.4'],
      connectTimeoutMs: 60_000,
      defaultQueryTimeoutMs: 60_000,
    });

    // Manejar las actualizaciones de credenciales
    this.sock.ev.on('creds.update', saveCreds);
    
    this.sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      if (qr) {
        this.currentQR = qr;
        console.log('🔐 Código QR generado. Visita: http://localhost:3000/qr');
      }
      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        this.isConnected = false;
        this.currentQR = '';
        if (shouldReconnect) this.initializeWhatsApp();
      } else if (connection === 'open') {
        console.log(whatsappConfig.messages.connectionSuccess);
        this.isConnected = true;
        this.currentQR = '';
        setTimeout(async () => {
          try {
            const groups = await this.getGroups();
            groups.forEach(group => {
              console.log(`- ${group.name}: ${group.id}`);
            });
          } catch (error) {
            console.log('No se pudieron obtener los grupos:', error.message);
          }
        }, 2000);
      }
    });

    // Detectar mensajes para obtener IDs de grupos
    this.sock.ev.on('messages.upsert', async (m) => {
      const msg = m.messages[0];
      if (!msg.key.fromMe && msg.key.remoteJid?.endsWith('@g.us')) {
        console.log('🔍 ID del grupo detectado:', msg.key.remoteJid);
        console.log('📝 Mensaje recibido:', msg.message?.conversation || 'Mensaje multimedia');
        
        // Obtener información del grupo
        try {
          const groupInfo = await this.sock.groupMetadata(msg.key.remoteJid);
          console.log('📋 Información del grupo:');
          console.log(`  - Nombre: ${groupInfo.subject}`);
          console.log(`  - ID: ${groupInfo.id}`);
          console.log(`  - Participantes: ${groupInfo.participants?.length || 0}`);
        } catch (error) {
          console.log('No se pudo obtener información del grupo:', error.message);
        }
      }
    });

    this.sock.ev.on('creds.update', saveCreds);
  }

  async sendWhatsAppMessage(groupId: string, message: string): Promise<boolean> {
    try {
      if (!this.isConnected || !this.sock || !this.sock.user) return false;
      await this.sock.sendMessage(groupId, { text: message });
      console.log('✅ ' + whatsappConfig.messages.messageSent);
      return true;
    } catch (error) {
      console.error('❌ ' + whatsappConfig.messages.messageError, error);
      return false;
    }
  }

  async sendImages(groupId: string, imageUrls: string[], captionPrefix = '') {
    for (let i = 0; i < imageUrls.length; i++) {
      const url = imageUrls[i];
      try {
        const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 60000 });
        const buffer = Buffer.from(response.data, 'binary');
        await this.sock.sendMessage(groupId, {
          image: buffer,
          caption: "",
        });
        console.log(`📤 Imagen ${i + 1} enviada`);
      } catch (err) {
        console.error(`❌ No se pudo enviar imagen ${i + 1}`, err.message);
      }
    }
  }

  async handleVehicleStatusUpdate(data: any): Promise<boolean> {
    try {
      const processedData = {
        ...data,
        placaTractor: Array.isArray(data.placaTractor) ? data.placaTractor.join(', ') : data.placaTractor,
        placaSemiRemolque: Array.isArray(data.placaSemiRemolque) ? data.placaSemiRemolque.join(', ') : data.placaSemiRemolque,
      };

      let message = '';
      if (data.tipoFormulario === 'checkList' || data.formulario === 'Check-List') {
        message = whatsappConfig.messages.checkList(processedData);
      } else if (data.tipoFormulario === 'reporteCorrectivos' || data.formulario === 'Reporte de Correctivos Diarios') {
        message = whatsappConfig.messages.reporteCorrectivos(processedData);
      } else if (data.tipoFormulario === 'documentosLegales' || data.formulario === 'Documentos Legales') {
        message = whatsappConfig.messages.documentosLegales(processedData);
      } else {
        message = whatsappConfig.messages.vehicleStatusUpdate(processedData);
      }

      const result = await this.sendWhatsAppMessage(whatsappConfig.groupId, message);

      if (Array.isArray(data.fotos)) {
        await this.sendImages(whatsappConfig.groupId, data.fotos);
      }
      if (Array.isArray(data.fotosTractor)) {
        await this.sendImages(whatsappConfig.groupId, data.fotosTractor,);
      }
      if (Array.isArray(data.fotosReeferCisterna)) {
        await this.sendImages(whatsappConfig.groupId, data.fotosReeferCisterna,);
      }

      return result;
    } catch (error) {
      console.error('❌ Error procesando actualización de estado:', error);
      return false;
    }
  }

  async getGroups(): Promise<any[]> {
    return [];
  }

  async generateQRImage(): Promise<string | null> {
    if (!this.currentQR) return null;
    return await QRCode.toDataURL(this.currentQR);
  }

  getConnectionStatus(): { isConnected: boolean; hasQR: boolean } {
    return { isConnected: this.isConnected, hasQR: !!this.currentQR };
  }

  async restartConnection(): Promise<void> {
    this.isConnected = false;
    this.currentQR = '';
    if (this.sock) await this.sock.logout();
    const authPath = path.join(process.cwd(), 'auth_info_baileys');
    if (fs.existsSync(authPath)) fs.rmSync(authPath, { recursive: true, force: true });
    setTimeout(() => this.initializeWhatsApp(), 3000);
  }
}
