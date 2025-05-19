import {
  CreateEventRequestDto,
  CreateEventResponseDto,
} from '@lib/dtos/event/create-event.dto';
import { GetEventByIdResponseDto } from '@lib/dtos/event/get-event-by-id.dto';
import {
  PaginateEventsRequestDto,
  PaginateEventsResponseDto,
} from '@lib/dtos/event/paginate-events.dto';
import { SoftDeleteEventResponseDto } from '@lib/dtos/event/soft-delete-event.dto';
import {
  UpdateEventRequestDto,
  UpdateEventResponseDto,
} from '@lib/dtos/event/update-event.dto';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EventService } from './event.service';

@Controller()
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @MessagePattern('event_paginate_events')
  async paginateEvents(
    @Payload() data: { paginateEventsRequestDto: PaginateEventsRequestDto },
  ): Promise<PaginateEventsResponseDto> {
    return this.eventService.paginateEvents(data);
  }

  @MessagePattern('event_create_event')
  async createEvent(
    @Payload() data: { createEventRequestDto: CreateEventRequestDto },
  ): Promise<CreateEventResponseDto> {
    return this.eventService.createEvent(data);
  }

  @MessagePattern('event_get_event_by_id')
  async getEventById(
    @Payload() data: { id: string },
  ): Promise<GetEventByIdResponseDto> {
    return this.eventService.getEventById(data);
  }

  @MessagePattern('event_update_event')
  async updateEvent(
    @Payload()
    data: {
      id: string;
      updateEventRequestDto: UpdateEventRequestDto;
    },
  ): Promise<UpdateEventResponseDto> {
    return this.eventService.updateEvent(data);
  }

  @MessagePattern('event_soft_delete_event')
  async softDeleteEvent(
    @Payload() data: { id: string },
  ): Promise<SoftDeleteEventResponseDto> {
    return this.eventService.softDeleteEvent(data);
  }
}
