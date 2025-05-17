import { GetRewardRequestByIdResponseDto } from '@lib/dtos/reward-request/get-reward-request-by-id.dto';
import {
  PaginateRewardRequestsRequestDto,
  PaginateRewardRequestsResponseDto,
} from '@lib/dtos/reward-request/paginate-reward-requests.dto';
import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BaseService } from './base.service';
import { AuthActant } from '@lib/types/actant.type';

@Injectable()
export class RewardRequestService extends BaseService {
  constructor(
    @Inject('EVENT_SERVICE') private readonly eventServiceClient: ClientProxy,
  ) {
    super(eventServiceClient);
  }

  async paginateRewardRequests(req: {
    actant: AuthActant;
    paginateRewardRequestsRequestDto: PaginateRewardRequestsRequestDto;
  }): Promise<PaginateRewardRequestsResponseDto> {
    const resp = await this.sendRequest<PaginateRewardRequestsResponseDto>(
      'reward_request_paginate_reward_requests',
      req,
    );

    return resp;
  }

  async getRewardRequestById(req: {
    actant: AuthActant;
    id: string;
  }): Promise<GetRewardRequestByIdResponseDto> {
    const resp = await this.sendRequest<any>(
      'reward_request_get_reward_request_by_id',
      req,
    );

    return resp;
  }
}
