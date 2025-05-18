import { MicroServiceType } from '@lib/enums/microservice.enum';
import { JwtStrategy } from '@lib/strategies/jwt.strategy';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './controllers/auth.controller';
import { EventController } from './controllers/event.controller';
import { RewardController } from './controllers/reward.controller';
import { UserController } from './controllers/user.controller';
import { GatewayService } from './gateway.service';
import { RewardRequestController } from './controllers/reward-request.controller';
import { LoggingMiddleware } from '@lib/middlewares/logging.middleware';

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
            host: configService.get('AUTH_SERVER_HOST', '0.0.0.0'),
            port: configService.get('AUTH_SERVER_PORT', 3001),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: MicroServiceType.EVENT_SERVER,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('EVENT_SERVER_HOST', '0.0.0.0'),
            port: configService.get('EVENT_SERVER_PORT', 3002),
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
    RewardRequestController,
  ],
  providers: [JwtStrategy, GatewayService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
