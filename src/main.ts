import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const port = config.get<number>('PORT', 4000);
  const apiPrefix = config.get<string>('API_PREFIX', 'api');
  const corsOrigin = config.get<string>('CORS_ORIGIN', '*');

  app.setGlobalPrefix(apiPrefix);

  app.enableCors({
    origin: ['http://localhost:3000', 'http://192.168.100.5:3000'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('SEU Development API')
    .setDescription('Backend for SEU Development — projects, buildings, units.')
    .setVersion('0.1.0')
    .addBearerAuth()
    .addTag('projects')
    .addTag('buildings')
    .addTag('units')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  await app.listen(port, '0.0.0.0');
  // eslint-disable-next-line no-console
  console.log(`SEU backend running on http://localhost:${port}/${apiPrefix}`);
  // eslint-disable-next-line no-console
  console.log(`Swagger docs:        http://localhost:${port}/${apiPrefix}/docs`);
}

bootstrap();
