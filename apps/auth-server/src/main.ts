import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: 3001,
    },
  });

  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     whitelist: true,
  //     forbidNonWhitelisted: true,
  //     transform: true,
  //   }),
  // );

  // const app = await NestFactory.create(AppModule);
  // const configService = app.get(ConfigService);
  // app.connectMicroservice({
  //   transport: Transport.TCP,
  //   options: {
  //     host: '127.0.0.1',
  //     port: configService.get('PORT'),
  //   },
  // });

  console.log('auth-server initialized');
  // app.useLogger(app.get(Logger));
  // await app.startAllMicroservices();

  await app.listen();
}
bootstrap();

// async function bootstrap() {
//   const app = await NestFactory.create(PaymentsModule);
//   const configService = app.get(ConfigService);
//   app.connectMicroservice({
//     transport: Transport.TCP,
//     options: {
//       host: '0.0.0.0',
//       port: configService.get('PORT'),
//     },
//   });
//   app.useLogger(app.get(Logger));
//   await app.startAllMicroservices();
// }
// bootstrap();
