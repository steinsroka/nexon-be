import { MicroServiceType } from '@lib/enums/microservice.enum';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { EventModule } from '../event/event.module';
import { RewardModule } from '../reward/reward.module';
import { RewardRequestController } from './reward-request.controller';
import { RewardRequestService } from './reward-request.service';
import {
  RewardRequest,
  RewardRequestSchema,
} from './schemas/reward-request.schema';

@Module({
  imports: [
    EventModule,
    RewardModule,
    MongooseModule.forFeature([
      {
        name: RewardRequest.name,
        schema: RewardRequestSchema,
        collection: 'reward_requests',
      },
    ]),

    ClientsModule.registerAsync([
      {
        name: MicroServiceType.AUTH_SERVER,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('AUTH_SERVER_HOST', 'localhost'),
            port: configService.get('AUTH_SERVER_PORT', 3001),
          },
        }),
      },
    ]),
  ],
  controllers: [RewardRequestController],
  providers: [RewardRequestService],
  exports: [RewardRequestService],
})
export class RewardRequestModule {}
