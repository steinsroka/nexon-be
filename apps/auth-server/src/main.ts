import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: new ConfigService().get('PORT', 3001),
    },
  });

  // const logger = new Logger('Bootstrap');
  // const configService = app.get(ConfigService);

  // app.connectMicroservice({
  //   transport: Transport.TCP,
  //   options: {
  //     host: '0.0.0.0',
  //     port: configService.get('PORT', 3001),
  //   },
  // });

  // app.use(cookieParser());
  // app.setGlobalPrefix('api/v1');
  // app.enableCors({
  //   origin: configService.get('CORS_ORIGIN', 'http://localhost:3000'), // TODO: set cors origin env
  //   credentials: true,
  // });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // const port = configService.get('PORT', 3001);
  await app.listen();

  // logger.log(`Server is running on http://localhost:${port}/api`);
  // logger.log(`Swagger is running on http://localhost:${port}/api/docs`);
}
bootstrap();
