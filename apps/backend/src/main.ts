import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 4000);
  console.log(`🚀 AgentZero API running on port ${process.env.PORT ?? 4000}`);
}
bootstrap();
