import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import * as dotenv from 'dotenv';

dotenv.config();

const server = express();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  // فعال‌سازی CORS برای لوکال و دامنه اصلی
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://mopastyle.de',
    ],
    credentials: true,
  });

  // ست کردن prefix برای همه‌ی روت‌ها
  app.setGlobalPrefix('api');

  await app.init();

  const port = process.env.PORT || 3001;
  server.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}/api`);
  });
}

bootstrap();

export default server;
