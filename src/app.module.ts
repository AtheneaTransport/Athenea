import { Module } from '@nestjs/common';
// import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [
    // ThrottlerModule.forRoot([
    //   {
    //     ttl: 60000, // 1 minuto
    //     limit: 10, // 10 requests por minuto
    //   },
    // ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
