import { MicroServiceType } from '@lib/enums/microservice.enum';
import { JwtStrategy } from '@lib/strategies/jwt.strategy';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './controllers/auth.controller';
import { EventController } from './controllers/event.controller';
import { RewardController } from './controllers/reward.controller';
import { UserController } from './controllers/user.controller';
import { GatewayService } from './gateway.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'local'}`,
    }),
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: MicroServiceType.AUTH_SERVICE,
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
        name: MicroServiceType.EVENT_SERVICE,
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
  providers: [JwtStrategy, GatewayService],
})
export class AppModule {}
