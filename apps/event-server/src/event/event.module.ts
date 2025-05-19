import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Reward, RewardSchema } from '../reward/schemas/reward.schema';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { Event, EventSchema } from './schemas/event.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema, collection: 'events' },
      { name: Reward.name, schema: RewardSchema, collection: 'rewards' },
    ]),
  ],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}
