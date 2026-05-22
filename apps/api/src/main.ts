import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Swagger 文档 — /api/docs
  const config = new DocumentBuilder()
    .setTitle('RDView API')
    .setDescription('弱电视频监控管理系统 API')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
  Logger.log(`🚀 RDView API listening on http://0.0.0.0:${port}`, 'Bootstrap');
  Logger.log(`📘 Docs: http://0.0.0.0:${port}/api/docs`, 'Bootstrap');
}
bootstrap();
