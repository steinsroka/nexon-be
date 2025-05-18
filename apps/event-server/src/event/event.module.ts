import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { EventSchema } from './schemas/event.schema';
import { Reward, RewardSchema } from '../reward/schemas/reward.schema';
import {
  RewardRequest,
  RewardRequestSchema,
} from '../reward-request/schemas/reward-request.schema';

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
  ],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}
