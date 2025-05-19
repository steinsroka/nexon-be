import { Controller } from '@nestjs/common';
import { RewardRequestService } from './reward-request.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  PaginateRewardRequestsRequestDto,
  PaginateRewardRequestsResponseDto,
} from '@lib/dtos/reward-request/paginate-reward-requests.dto';
import { CreateEventRewardRequestResponseDto } from '@lib/dtos/event/create-event-reward-request.dto';
import { AuthActant } from '@lib/types';
import { GetRewardRequestByIdResponseDto } from '@lib/dtos/reward-request/get-reward-request-by-id.dto';

@Controller()
export class RewardRequestController {
  constructor(private readonly rewardRequestService: RewardRequestService) {}

  @MessagePattern('reward_request_paginate_reward_requests')
  async paginateRewardRequests(
    @Payload()
    data: {
      actant: AuthActant;
      paginateRewardRequestsRequestDto: PaginateRewardRequestsRequestDto;
    },
  ): Promise<PaginateRewardRequestsResponseDto> {
    return this.rewardRequestService.paginateRewardRequests(data);
  }

  @MessagePattern('reward_request_get_reward_request_by_id')
  async getRewardRequestById(
    @Payload() data: { actant: AuthActant; id: string },
  ): Promise<GetRewardRequestByIdResponseDto> {
    return this.rewardRequestService.getRewardRequestById(data);
  }

  // NOTE: Endpoint 는 event 서버에 있지만, 로직 분리를 위해 reward-request 서버에서 처리
  @MessagePattern('event_create_event_reward_request')
  async createEventRewardRequest(
    @Payload()
    data: {
      actant: AuthActant;
      id: string;
      createEventRewardRequestDto: CreateEventRewardRequestResponseDto;
    },
  ): Promise<CreateEventRewardRequestResponseDto> {
    return this.rewardRequestService.createEventRewardRequest(data);
  }
}
