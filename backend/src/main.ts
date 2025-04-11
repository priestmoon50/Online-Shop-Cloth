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
      'http://localhost:3001',
      'http://localhost:3002',
      'http://mopastyle.de',
    ],
    credentials: true,
  });

  app.setGlobalPrefix('api');

  await app.init();

  const port = process.env.PORT || 3002;

  // فقط این listen باید باشه — نه app.listen
  server.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}/api`);
  });
}

bootstrap().catch((err) => {
  console.error('❌ Error during bootstrap:', err);
});
