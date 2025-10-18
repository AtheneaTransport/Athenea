import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { securityConfig } from '../config/security.config.js';

@Injectable()
export class WebhookAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Obtener el header de autenticación
    const providedSecret = request.headers[securityConfig.authHeaders.secret.toLowerCase()] as string;
    
    // Validar que el header existe
    if (!providedSecret) {
      throw new UnauthorizedException({
        success: false,
        message: 'Header de autenticación requerido',
        details: `Incluye el header: ${securityConfig.authHeaders.secret}`
      });
    }
    
    // Validar la palabra clave
    if (providedSecret !== securityConfig.webhookSecret) {
      throw new UnauthorizedException({
        success: false,
        message: 'Palabra clave de autenticación inválida',
        timestamp: new Date().toISOString()
      });
    }
    
    console.log('✅ Webhook autenticado correctamente');
    return true;
  }
} 