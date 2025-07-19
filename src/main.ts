import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configurar helmet para seguridad
  app.use(helmet({
    contentSecurityPolicy: false, // Desactivar CSP para evitar problemas con inline styles
    crossOriginEmbedderPolicy: false
  }));
  
  // Habilitar CORS
  app.enableCors();
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
