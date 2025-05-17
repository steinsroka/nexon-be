import {
  CreateEventRequestDto,
  CreateEventResponseDto,
} from '@lib/dtos/event/create-event.dto';
import {
  PaginateEventsRequestDto,
  PaginateEventsResponseDto,
} from '@lib/dtos/event/paginate-event.dto';
import {
  UpdateEventRequestDto,
  UpdateEventResponseDto,
} from '@lib/dtos/event/update-event.dto';
import { AuthActant } from '@lib/types/actant.type';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BaseService } from './base.service';
import { GetEventByIdResponseDto } from '@lib/dtos/event/get-event-by-id.dto';
import { SoftDeleteEventResponseDto } from '@lib/dtos/event/soft-delete-event.dto';

@Injectable()
export class EventService extends BaseService {
  constructor(
    @Inject('EVENT_SERVICE') private readonly eventServiceClient: ClientProxy,
  ) {
    super(eventServiceClient);
  }

  async paginateEvents(req: {
    paginateEventsRequestDto: PaginateEventsRequestDto;
  }): Promise<PaginateEventsResponseDto> {
    const resp = await this.sendRequest<PaginateEventsResponseDto>(
      'event_paginate_events',
      req,
    );

    return resp;
  }

  async createEvent(req: {
    actant: AuthActant;
    createEventRequestDto: CreateEventRequestDto;
  }): Promise<CreateEventResponseDto> {
    const resp = await this.sendRequest<CreateEventResponseDto>(
      'event_create_event',
      req,
    );

    return resp;
  }

  async getEventById(req: { id: string }): Promise<GetEventByIdResponseDto> {
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

  async softDeleteEvent(req: {
    actant: AuthActant;
    id: string;
  }): Promise<SoftDeleteEventResponseDto> {
    const resp = await this.sendRequest<SoftDeleteEventResponseDto>(
      'event_soft_delete_event',
      req,
    );

    return resp;
  }
}
