import { Controller } from '@nestjs/common';
import { EventService } from './event.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @MessagePattern('event_paginate_events')
  async paginateEvents(event: any): Promise<any> {
    return this.eventService.paginateEvents(event);
  }

  @MessagePattern('event_create_event')
  async createEvent(event: any): Promise<any> {
    return this.eventService.createEvent(event);
  }

  @MessagePattern('event_get_event_by_id')
  async getEventById(event: any): Promise<any> {
    return this.eventService.getEventById(event);
  }

  @MessagePattern('event_update_event')
  async updateEvent(event: any): Promise<any> {
    return this.eventService.updateEvent(event);
  }

  @MessagePattern('event_soft_delete_event')
  async softDeleteEvent(event: any): Promise<any> {
    return this.eventService.softDeleteEvent(event);
  }
}
