import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { GatewayModule } from './gateway.module';
import { RpcExceptionFilter } from './filters/rpc-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule, {
    logger: ['error', 'warn', 'log', 'verbose', 'debug'],
  });

  const logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService);

  app.use(cookieParser());
  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: configService.get('CORS_ORIGIN', 'http://localhost:3000'), // TODO: set cors origin env
    credentials: true,
  });

  // 글로벌 예외 필터 등록 - 마이크로서비스의 RPC 예외를 HTTP 예외로 변환
  app.useGlobalFilters(new RpcExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Nexon API')
    .setDescription('Nexon API 문서')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('refresh_token')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get('PORT', 3000);

  await app.listen(port);

  logger.log(`Server is running on http://localhost:${port}/api`);
  logger.log(`Swagger is running on http://localhost:${port}/api/docs`);
}
bootstrap();
