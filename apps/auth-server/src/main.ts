import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AuthServerModule } from './auth-server.module';
import { MicroserviceExceptionFilter } from '@lib/filters/microservice-exception.filter';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AuthServerModule, {
    transport: Transport.TCP,
    options: {
      host: process.env.AUTH_SERVER_HOST || 'localhost',
      port: 3001,
    },
  });

  app.useGlobalFilters(new MicroserviceExceptionFilter());

  await app.listen();
}
bootstrap();
