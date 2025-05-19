import {
  CreateEventRequestDto,
  CreateEventResponseDto,
} from '@lib/dtos/event/create-event.dto';
import { CreateEventRewardRequestResponseDto } from '@lib/dtos/event/create-event-reward-request.dto';
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
import { MicroServiceType } from '@lib/enums/microservice.enum';
import { AuthActant } from '@lib/types/actant.type';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { REQUEST } from '@nestjs/core';
import { BaseGatewayService } from './base-gateway.service';

/**
 * Service for handling event-related gateway operations
 */
@Injectable()
export class EventGatewayService extends BaseGatewayService {
  /**
   * Constructs the event gateway service
   *
   * @param eventServiceClient - The event microservice client
   * @param request - The current HTTP request
   */
  constructor(
    @Inject(MicroServiceType.EVENT_SERVER)
    protected readonly eventServiceClient: ClientProxy,
    @Inject(REQUEST) protected readonly request: Request,
  ) {
    super(eventServiceClient, request);
  }

  /**
   * Retrieves paginated events
   *
   * @param paginateEventsRequestDto - The pagination parameters
   * @returns A promise that resolves to the paginated events
   */
  async paginateEvents(
    paginateEventsRequestDto: PaginateEventsRequestDto,
  ): Promise<PaginateEventsResponseDto> {
    return this.sendRequest<PaginateEventsResponseDto>(
      'event_paginate_events',
      { paginateEventsRequestDto },
    );
  }

  async createEvent(
    actant: AuthActant,
    createEventRequestDto: CreateEventRequestDto,
  ): Promise<CreateEventResponseDto> {
    return this.sendRequest<CreateEventResponseDto>('event_create_event', {
      actant,
      createEventRequestDto,
    });
  }

  async getEventById(id: string): Promise<GetEventByIdResponseDto> {
    return this.sendRequest<GetEventByIdResponseDto>('event_get_event_by_id', {
      id,
    });
  }

  async updateEvent(
    actant: AuthActant,
    id: string,
    updateEventRequestDto: UpdateEventRequestDto,
  ): Promise<UpdateEventResponseDto> {
    return this.sendRequest<UpdateEventResponseDto>('event_update_event', {
      actant,
      id,
      updateEventRequestDto,
    });
  }

  async softDeleteEvent(
    actant: AuthActant,
    id: string,
  ): Promise<SoftDeleteEventResponseDto> {
    return this.sendRequest<SoftDeleteEventResponseDto>(
      'event_soft_delete_event',
      { actant, id },
    );
  }

  async createEventRewardRequest(
    actant: AuthActant,
    id: string,
  ): Promise<CreateEventRewardRequestResponseDto> {
    return this.sendRequest<CreateEventRewardRequestResponseDto>(
      'event_create_event_reward_request',
      { actant, id },
    );
  }

  protected getServiceType(): MicroServiceType {
    return MicroServiceType.EVENT_SERVER;
  }
}
