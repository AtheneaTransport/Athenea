import { Injectable } from '@nestjs/common';
import { 
  makeWASocket, 
  DisconnectReason, 
  useMultiFileAuthState, 
  WASocket, 
  proto,
  fetchLatestBaileysVersion  // 🔹 CRÍTICO: Obtener versión correcta
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import * as fs from 'fs';
import * as path from 'path';
import { whatsappConfig } from './config/whatsapp.config';
import * as QRCode from 'qrcode';
import axios from 'axios';
import P from 'pino';

@Injectable()
export class AppService {
  private sock: WASocket;
  private isConnected = false;
  private currentQR: string = '';
  private messageCache = new Map<string, proto.IMessage>();
  private readonly MAX_CACHE_SIZE = 1000;

  constructor() {
    // Iniciar con delay
    setTimeout(() => {
      this.initializeWhatsApp();
    }, 2000);
  }

  private async initializeWhatsApp() {
    try {
      // 🔹 PASO 1: Obtener la última versión de Baileys (CRÍTICO)
      const { version, isLatest } = await fetchLatestBaileysVersion();
      console.log(`🔄 Usando versión de WA: ${version.join('.')} (¿Es la última? ${isLatest})`);

      // 🔹 PASO 2: Cargar estado de autenticación
      const { state, saveCreds } = await useMultiFileAuthState(whatsappConfig.baileys.authPath);
      
      console.log('🚀 Iniciando conexión con WhatsApp...');
      
      // 🔹 PASO 3: Crear socket con configuración MÍNIMA y CORRECTA
      this.sock = makeWASocket({
        version, // 🔹 USAR LA VERSIÓN OBTENIDA
        auth: state,
        printQRInTerminal: true, // Mantener para debug
        // 🔹 Browser correcto
        browser: ['Chrome (Linux)', '', ''],
        // 🔹 getMessage para caché
        getMessage: async (key) => {
          const msgId = `${key.remoteJid}_${key.id}`;
          return this.messageCache.get(msgId);
        },
        // 🔹 Logger silencioso
        logger: P({ level: 'silent' }),
      });

      // Guardar credenciales
      this.sock.ev.on('creds.update', saveCreds);
      
      // Manejo de conexión
      this.sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
          this.currentQR = qr;
          console.log('✅ QR GENERADO - Escanea desde: http://localhost:3000/qr');
        }
        
        if (connection === 'close') {
          const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
          this.isConnected = false;
          this.currentQR = '';
          
          console.log(`❌ Conexión cerrada (código: ${statusCode})`);
          
          // 🔹 NO reconectar en error 405 - es probable que sea IP bloqueada
          if (statusCode === 405) {
            console.log('⚠️ ERROR 405: Tu IP puede estar temporalmente bloqueada por WhatsApp');
            console.log('💡 SOLUCIONES POSIBLES:');
            console.log('   1. Espera 30 minutos a 1 hora antes de reintentar');
            console.log('   2. Cambia tu red (usa hotspot de celular)');
            console.log('   3. Usa un proxy/VPN');
            console.log('   4. Borra auth_info_baileys y escanea un QR nuevo');
            return; // NO RECONECTAR
          }
          
          // Reconectar solo en casos específicos
          if (statusCode === DisconnectReason.restartRequired) {
            console.log('🔄 Reinicio requerido...');
            setTimeout(() => this.initializeWhatsApp(), 3000);
          } else if (statusCode === DisconnectReason.connectionLost) {
            console.log('🔄 Conexión perdida, reconectando...');
            setTimeout(() => this.initializeWhatsApp(), 5000);
          } else if (statusCode !== DisconnectReason.loggedOut) {
            console.log('💡 Escanea el QR en: http://localhost:3000/qr');
          }
        } else if (connection === 'open') {
          console.log('✅ ¡CONECTADO EXITOSAMENTE A WHATSAPP!');
          this.isConnected = true;
          this.currentQR = '';
        }
      });

      // Cachear mensajes
      this.sock.ev.on('messages.upsert', async (m) => {
        for (const msg of m.messages) {
          if (msg.message && msg.key.id) {
            const msgId = `${msg.key.remoteJid}_${msg.key.id}`;
            this.messageCache.set(msgId, msg.message);
            
            // Limpiar caché si excede límite
            if (this.messageCache.size > this.MAX_CACHE_SIZE) {
              const firstKey = this.messageCache.keys().next().value;
              this.messageCache.delete(firstKey);
            }
          }

          // Log de mensajes de grupos
          if (!msg.key.fromMe && msg.key.remoteJid?.endsWith('@g.us')) {
            console.log('📩 Mensaje recibido en grupo:', msg.key.remoteJid);
          }
        }
      });
      
    } catch (error) {
      console.error('❌ Error iniciando WhatsApp:', error.message);
      console.log('💡 Intenta: rm -rf auth_info_baileys && npm run start:dev');
    }
  }

  async sendWhatsAppMessage(groupId: string, message: string): Promise<boolean> {
    try {
      if (!this.isConnected || !this.sock || !this.sock.user) {
        console.error('❌ WhatsApp no conectado');
        return false;
      }

      // Enviar mensaje
      const sentMsg = await this.sock.sendMessage(groupId, { text: message });

      // Guardar en caché
      if (sentMsg && sentMsg.key.id) {
        const msgId = `${groupId}_${sentMsg.key.id}`;
        this.messageCache.set(msgId, { conversation: message });
      }

      console.log('✅ Mensaje enviado correctamente');
      return true;

    } catch (error) {
      console.error('❌ Error enviando mensaje:', error.message);
      return false;
    }
  }

  async sendImages(groupId: string, imageUrls: string[], captionPrefix = '') {
    for (let i = 0; i < imageUrls.length; i++) {
      try {
        const response = await axios.get<ArrayBuffer>(imageUrls[i], { 
          responseType: 'arraybuffer', 
          timeout: 60000 
        });
        const buffer = Buffer.from(response.data);
        
        await this.sock.sendMessage(groupId, {
          image: buffer,
          caption: "",
        });

        console.log(`✅ Imagen ${i + 1}/${imageUrls.length} enviada`);
        
        // Delay entre imágenes
        if (i < imageUrls.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }

      } catch (err) {
        console.error(`❌ Error enviando imagen ${i + 1}:`, err.message);
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

      if (result) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (Array.isArray(data.fotos) && data.fotos.length > 0) {
        await this.sendImages(whatsappConfig.groupId, data.fotos);
      }
      if (Array.isArray(data.fotosTractor) && data.fotosTractor.length > 0) {
        await this.sendImages(whatsappConfig.groupId, data.fotosTractor);
      }
      if (Array.isArray(data.fotosReeferCisterna) && data.fotosReeferCisterna.length > 0) {
        await this.sendImages(whatsappConfig.groupId, data.fotosReeferCisterna);
      }

      return result;
    } catch (error) {
      console.error('❌ Error procesando actualización:', error);
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
    try {
      console.log('🔄 Reiniciando conexión...');
      this.isConnected = false;
      this.currentQR = '';
      this.messageCache.clear();

      if (this.sock) {
        try {
          await this.sock.logout();
        } catch (e) {
          console.log('Info: Error cerrando sesión (normal)');
        }
        this.sock = null;
      }

      const authPath = path.join(process.cwd(), 'auth_info_baileys');
      if (fs.existsSync(authPath)) {
        fs.rmSync(authPath, { recursive: true, force: true });
        console.log('✅ Sesión limpiada');
      }

      console.log('⏳ Esperando 10 segundos antes de reiniciar...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      await this.initializeWhatsApp();
      console.log('✅ Reinicio completado');
    } catch (error) {
      console.error('❌ Error reiniciando:', error.message);
      throw error;
    }
  }
}