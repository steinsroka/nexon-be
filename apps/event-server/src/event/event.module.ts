import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { EventSchema } from './schemas/event.schema';
import { Reward, RewardSchema } from '../reward/schemas/reward.schema';
import {
  RewardRequest,
  RewardRequestSchema,
} from '../reward-request/schemas/reward-request.schema';
import { MicroServiceType } from '@lib/enums/microservice.enum';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema, collection: 'events' },
      { name: Reward.name, schema: RewardSchema, collection: 'rewards' },
      {
        name: RewardRequest.name,
        schema: RewardRequestSchema,
        collection: 'events',
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
            host: configService.get('AUTH_SERVER_HOST', '0.0.0.0'),
            port: configService.get('AUTH_SERVER_PORT', 3001),
          },
        }),
      },
    ]),
  ],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}
