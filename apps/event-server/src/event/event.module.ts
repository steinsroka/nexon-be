import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RewardRequest,
  RewardRequestSchema,
} from '../reward-request/schemas/reward-request.schema';
import { Reward, RewardSchema } from '../reward/schemas/reward.schema';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { Event, EventSchema } from './schemas/event.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema, collection: 'events' },
      { name: Reward.name, schema: RewardSchema, collection: 'rewards' },
      {
        name: RewardRequest.name,
        schema: RewardRequestSchema,
        collection: 'reward_requests',
      },
    ]),
  ],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}
