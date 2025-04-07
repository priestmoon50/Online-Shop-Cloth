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
      'http://localhost:3000',
    ],
    credentials: true,
  });

  await app.init();

  // اضافه کردن پورت برای اجرای سرور
  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
  });
}

bootstrap();

export default server;
