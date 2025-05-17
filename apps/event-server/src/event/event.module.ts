import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { Event, EventSchema } from './schemas/event.schemas';
import { MongooseModule } from '@nestjs/mongoose';
import { RolesGuard } from '@lib/guards/roles.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema, collection: 'events' },
    ]),
  ],
  controllers: [EventController],
  providers: [EventService, RolesGuard],
})
export class EventModule {}
