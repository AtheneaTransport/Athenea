import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js'; // Agregar .js
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.use(helmet());
  app.enableCors();
  
  await app.listen(process.env.PORT || 3000);
  console.log(`🚀 Aplicación corriendo en puerto ${process.env.PORT || 3000}`);
}
bootstrap();