import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AuthServerModule } from './auth-server.module';
import { MicroserviceExceptionFilter } from '@lib/filters/microservice-exception.filter';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('AuthServerBootstrap');

  // Docker 환경에서 호스트 바인딩 문제 해결을 위해 '0.0.0.0' 사용
  const host = process.env.AUTH_SERVER_HOST || '0.0.0.0';
  const port = parseInt(process.env.AUTH_SERVER_PORT || '3001', 10);

  logger.log(`Starting Auth Server on ${host}:${port}`);

  const app = await NestFactory.createMicroservice(AuthServerModule, {
    transport: Transport.TCP,
    options: {
      host: host,
      port: port,
    },
  });

  app.useGlobalFilters(new MicroserviceExceptionFilter());

  await app.listen();
  logger.log(`Auth Server is running on ${host}:${port}`);
}
bootstrap();
