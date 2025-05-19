import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { MicroserviceExceptionFilter } from '@lib/filters/microservice-exception.filter';
import { EventServerModule } from './event-server.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('EventServerBootstrap');

  const host = process.env.EVENT_SERVER_HOST || '0.0.0.0';
  const port = parseInt(process.env.EVENT_SERVER_PORT || '3002', 10);

  logger.log(`Starting Event Server on ${host}:${port}`);

  const app = await NestFactory.createMicroservice(EventServerModule, {
    transport: Transport.TCP,
    options: {
      host: host,
      port: port,
    },
  });

  app.useGlobalFilters(new MicroserviceExceptionFilter());

  await app.listen();
  logger.log(`Event Server is running on ${host}:${port}`);
}
bootstrap();
