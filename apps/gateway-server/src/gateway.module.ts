import { DEFAULT_JWT_ACCESS_EXPIRES } from '@lib/constants/auth.constant';
import {
  DEFAULT_AUTH_SERVER_PORT,
  DEFAULT_EVENT_SERVER_PORT,
} from '@lib/constants/common.constant';
import { MicroServiceType } from '@lib/enums/microservice.enum';
import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './controllers/auth.controller';
import { EventController } from './controllers/event.controller';
import { RewardRequestController } from './controllers/reward-request.controller';
import { RewardController } from './controllers/reward.controller';
import { UserActivityController } from './controllers/user-activity.controller';
import { UserController } from './controllers/user.controller';
import { AuthService } from './services/auth.service';
import { EventService } from './services/event.service';
import { RewardRequestService } from './services/reward-request.service';
import { RewardService } from './services/reward.service';
import { TokenBlacklistService } from './services/token-blacklist.service';
import { UserActivityService } from './services/user-activity.service';
import { UserService } from './services/user.service';
import { LoggingMiddleware } from './middlewares/logging.middleware';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'local'}`,
    }),
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: MicroServiceType.AUTH_SERVER,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('AUTH_SERVER_HOST', 'localhost'),
            port: configService.get(
              'AUTH_SERVER_PORT',
              DEFAULT_AUTH_SERVER_PORT,
            ),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: MicroServiceType.EVENT_SERVER,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('EVENT_SERVER_HOST', 'localhost'),
            port: configService.get(
              'EVENT_SERVER_PORT',
              DEFAULT_EVENT_SERVER_PORT,
            ),
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
          expiresIn: configService.get(
            'JWT_ACCESS_EXPIRES_IN',
            DEFAULT_JWT_ACCESS_EXPIRES,
          ),
        },
      }),
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 15 * 60,
    }),
  ],
  controllers: [
    AuthController,
    UserController,
    UserActivityController,
    EventController,
    RewardController,
    RewardRequestController,
  ],
  providers: [
    JwtStrategy,
    TokenBlacklistService,
    AuthService,
    EventService,
    RewardService,
    RewardRequestService,
    UserService,
    UserActivityService,
  ],
})
export class GatewayModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
