import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

import * as dotenv from 'dotenv';

dotenv.config();

const server = express();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  app.enableCors({
    origin: [
      'https://modapersia.vercel.app', // اینجا آدرس فرانت‌اند اصلی رو بذار
      'http://localhost:3000', // برای تست لوکال
    ],
    credentials: true,
  });

  await app.init();
}

bootstrap();

export default server;
