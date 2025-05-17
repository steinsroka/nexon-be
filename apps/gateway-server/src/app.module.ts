import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { JwtStrategy } from '@lib/strategies/jwt.strategy';
import { EventService } from './services/event.service';
import { UserController } from './controllers/user.controller';
import { EventController } from './controllers/event.controller';
import { RewardService } from './services/reward.service';
import { RewardController } from './controllers/reward.controller';

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
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_ACCESS_EXPIRES_IN'),
        },
      }),
    }),
  ],
  controllers: [
    AuthController,
    UserController,
    EventController,
    RewardController,
  ],
  providers: [
    AuthService,
    UserService,
    EventService,
    RewardService,
    JwtStrategy,
  ],
})
export class AppModule {}
