import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { MicroserviceExceptionFilter } from '@lib/filters/microservice-exception.filter';
import { EventServerModule } from './event-server.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(EventServerModule, {
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: 3002,
    },
  });

  app.useGlobalFilters(new MicroserviceExceptionFilter());

  await app.listen();
}
bootstrap();
