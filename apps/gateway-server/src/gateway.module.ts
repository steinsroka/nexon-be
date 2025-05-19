import { DEFAULT_JWT_ACCESS_EXPIRES } from '@lib/constants/auth.constant';
import {
  DEFAULT_AUTH_SERVER_PORT,
  DEFAULT_EVENT_SERVER_PORT,
} from '@lib/constants/common.constant';
import { MicroServiceType } from '@lib/enums/microservice.enum';
import { LoggingMiddleware } from '@lib/middlewares/logging.middleware';
import { JwtStrategy } from '@lib/strategies/jwt.strategy';
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
import { AuthGatewayService } from './services/auth-gateway.service';
import { EventGatewayService } from './services/event-gateway.service';
import { RewardGatewayService } from './services/reward-gateway.service';
import { RewardRequestGatewayService } from './services/reward-request-gateway.service';
import { TokenBlacklistService } from './services/token-blacklist.service';
import { UserActivityGatewayService } from './services/user-activity-gateway.service';
import { UserGatewayService } from './services/user-gateway.service';
import { CacheModule } from '@nestjs/cache-manager';

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
    AuthGatewayService,
    EventGatewayService,
    RewardGatewayService,
    RewardRequestGatewayService,
    UserGatewayService,
    UserActivityGatewayService,
  ],
})
export class GatewayModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
