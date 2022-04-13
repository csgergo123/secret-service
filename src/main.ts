import * as config from 'config';

import { HttpStatus, Logger, LogLevel, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('bootstrap');

  const serverConfig = config.get('server');
  const environment = config.get('environment');
  const logConfig = config.get('log');

  let logLevels: LogLevel[];
  if (environment === 'development') {
    logLevels = ['log', 'error', 'warn', 'debug', 'verbose'];
  } else if (logConfig.level === 'debug') {
    logLevels = ['log', 'error', 'warn', 'debug'];
  } else if (logConfig.level === 'error') {
    logLevels = ['log', 'error'];
  } else {
    // Production
    logLevels = ['log', 'error', 'warn'];
  }

  const app = await NestFactory.create(AppModule, {
    logger: logLevels,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      errorHttpStatusCode: HttpStatus.METHOD_NOT_ALLOWED,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const options = new DocumentBuilder()
    .setTitle('Secret service API')
    .setDescription('Secret service API')
    .setVersion('0.1')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('swagger', app, document);

  const port = process.env.PORT || serverConfig.port;

  await app.listen(port);

  logger.log(`Application listening on ${port}`);
}
bootstrap();
