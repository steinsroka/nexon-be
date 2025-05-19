import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { GatewayModule } from './gateway.module';
import { RpcExceptionFilter } from './filters/rpc-exception.filter';
import {
  API_PREFIX,
  API_VERSION,
  DEFAULT_CORS_ORIGIN,
  DEFAULT_GATEWAY_PORT,
  SWAGGER_DESCRIPTION,
  SWAGGER_PATH,
  SWAGGER_TITLE,
} from '@lib/constants/common.constant';
import { REFRESH_TOKEN_COOKIE_NAME } from '@lib/constants/auth.constant';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule, {
    logger: ['error', 'warn', 'log', 'verbose', 'debug'],
  });

  const logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService);

  app.use(cookieParser());
  app.setGlobalPrefix(API_PREFIX);
  app.enableCors({
    origin: configService.get('CORS_ORIGIN', DEFAULT_CORS_ORIGIN), // TODO: set cors origin env
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
    .setTitle(SWAGGER_TITLE)
    .setDescription(SWAGGER_DESCRIPTION)
    .setVersion(API_VERSION)
    .addBearerAuth()
    .addCookieAuth(REFRESH_TOKEN_COOKIE_NAME)
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(SWAGGER_PATH, app, document);

  const port = configService.get('PORT', DEFAULT_GATEWAY_PORT);

  await app.listen(port);

  logger.log(`Server is running on http://localhost:${port}/api`);
  logger.log(`Swagger is running on http://localhost:${port}/api/docs`);
}
bootstrap();
