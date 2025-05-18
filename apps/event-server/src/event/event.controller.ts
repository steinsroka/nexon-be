import { CreateEventResponseDto } from '@lib/dtos/event/create-event.dto';
import { GetEventByIdResponseDto } from '@lib/dtos/event/get-event-by-id.dto';
import { PaginateEventsResponseDto } from '@lib/dtos/event/paginate-events.dto';
import { SoftDeleteEventResponseDto } from '@lib/dtos/event/soft-delete-event.dto';
import { UpdateEventResponseDto } from '@lib/dtos/event/update-event.dto';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EventService } from './event.service';

@Controller()
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @MessagePattern('event_paginate_events')
  async paginateEvents(
    @Payload() event: any,
  ): Promise<PaginateEventsResponseDto> {
    return this.eventService.paginateEvents(event);
  }

  @MessagePattern('event_create_event')
  async createEvent(@Payload() event: any): Promise<CreateEventResponseDto> {
    return this.eventService.createEvent(event);
  }

  @MessagePattern('event_get_event_by_id')
  async getEventById(@Payload() event: any): Promise<GetEventByIdResponseDto> {
    return this.eventService.getEventById(event);
  }

  @MessagePattern('event_update_event')
  async updateEvent(@Payload() event: any): Promise<UpdateEventResponseDto> {
    return this.eventService.updateEvent(event);
  }

  @MessagePattern('event_soft_delete_event')
  async softDeleteEvent(
    @Payload() event: any,
  ): Promise<SoftDeleteEventResponseDto> {
    return this.eventService.softDeleteEvent(event);
  }
}
