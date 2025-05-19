import { GetRewardRequestSummaryByIdResponseDto } from '@lib/dtos/reward-request/get-reward-request-by-id.dto';
import {
  PaginateRewardRequestsRequestDto,
  PaginateRewardRequestsResponseDto,
} from '@lib/dtos/reward-request/paginate-reward-requests.dto';
import { MicroServiceType } from '@lib/enums/microservice.enum';
import { AuthActant } from '@lib/types/actant.type';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { REQUEST } from '@nestjs/core';
import { BaseGatewayService } from './base.service';

@Injectable()
export class RewardRequestService extends BaseGatewayService {
  constructor(
    @Inject(MicroServiceType.EVENT_SERVER)
    protected readonly eventServiceClient: ClientProxy,
    @Inject(REQUEST) protected readonly request: Request,
  ) {
    super(eventServiceClient, request);
  }

  async paginateRewardRequests(
    actant: AuthActant,
    paginateRewardRequestsRequestDto: PaginateRewardRequestsRequestDto,
  ): Promise<PaginateRewardRequestsResponseDto> {
    return this.sendRequest<PaginateRewardRequestsResponseDto>(
      'reward_request_paginate_reward_requests',
      { actant, paginateRewardRequestsRequestDto },
    );
  }

  async getRewardRequestSummaryById(
    actant: AuthActant,
    id: string,
  ): Promise<GetRewardRequestSummaryByIdResponseDto> {
    return this.sendRequest<GetRewardRequestSummaryByIdResponseDto>(
      'reward_request_get_reward_request_by_id',
      { actant, id },
    );
  }

  protected getServiceType(): MicroServiceType {
    return MicroServiceType.EVENT_SERVER;
  }
}
