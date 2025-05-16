import { Module } from '@nestjs/common';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from '@lib/strategies/jwt.strategy';

export const AUTH_SERVICE = 'AUTH_SERVICE';
export const USER_SERVICE = 'USER_SERVICE';
export const EVENT_SERVICE = 'EVENT_SERVICE';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'local'}`,
    }),
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: AUTH_SERVICE,
        useFactory: () => ({
          transport: Transport.TCP,
          options: {
            host: '0.0.0.0',
            port: 3001,
            // host: configService.get('AUTH_SERVICE_URL'),
            // port: configService.get('AUTH_PORT'),
          },
        }),
        inject: [ConfigService],
      },
      {
        imports: [ConfigModule],
        name: USER_SERVICE,
        useFactory: () => ({
          transport: Transport.TCP,
          options: {
            host: '0.0.0.0',
            port: 3001,
            // host: configService.get('AUTH_SERVICE_URL'),
            // port: configService.get('AUTH_PORT'),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: EVENT_SERVICE,
        useFactory: () => ({
          transport: Transport.TCP,
          options: {
            host: '127.0.0.1',
            port: 3002,
            // host: configService.get('EVENT_HOST'),
            // port: configService.get('EVENT_PORT'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AppModule {}
