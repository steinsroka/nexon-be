import { RegisterResponseDto } from '@lib/dtos/auth/register.dto';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BaseService } from './base.service';
import {
  CreateEventRequestDto,
  CreateEventResponseDto,
} from '@lib/dtos/event/create-event.dto';
import { AuthActant } from '@lib/types/actant.type';
import {
  UpdateEventRequestDto,
  UpdateEventResponseDto,
} from '@lib/dtos/event/update-event.dto';

@Injectable()
export class EventService extends BaseService {
  constructor(
    @Inject('EVENT_SERVICE') private readonly eventServiceClient: ClientProxy,
  ) {
    super(eventServiceClient);
  }

  async paginateEvents(req: any): Promise<any> {
    const resp = await this.sendRequest<RegisterResponseDto>(
      'event_paginate_events',
      req,
    );

    return resp;
  }

  async createEvent(req: {
    actant: AuthActant;
    createEventRequestDto: CreateEventRequestDto;
  }): Promise<any> {
    const resp = await this.sendRequest<CreateEventResponseDto>(
      'event_create_event',
      req,
    );

    return resp;
  }

  async getEventById(req: { id: string }): Promise<any> {
    const resp = await this.sendRequest<any>('event_get_event_by_id', req);

    return resp;
  }

  async updateEvent(req: {
    actant: AuthActant;
    id: string;
    updateEventRequestDto: UpdateEventRequestDto;
  }): Promise<UpdateEventResponseDto> {
    const resp = await this.sendRequest<UpdateEventResponseDto>(
      'event_update_event',
      req,
    );

    return resp;
  }

  async softDeleteEvent(req: any): Promise<any> {
    const resp = await this.sendRequest<RegisterResponseDto>(
      'event_soft_delete_event',
      req,
    );

    return resp;
  }
}
