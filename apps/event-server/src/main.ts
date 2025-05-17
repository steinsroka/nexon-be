import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { MicroserviceExceptionFilter } from '@lib/filters/microservice-exception.filter';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: 3002,
    },
  });

  app.useGlobalFilters(new MicroserviceExceptionFilter());

  await app.listen();
}
bootstrap();
