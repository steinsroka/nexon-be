import { Controller } from '@nestjs/common';
import { RewardRequestService } from './reward-request.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PaginateRewardRequestsResponseDto } from '@lib/dtos/reward-request/paginate-reward-requests.dto';
import { CreateEventRewardRequestResponseDto } from '@lib/dtos/event/create-event-reward-request.dto';

@Controller()
export class RewardRequestController {
  constructor(private readonly rewardRequestService: RewardRequestService) {}

  @MessagePattern('reward_request_paginate_reward_requests')
  async paginateRewardRequests(
    @Payload() event: any,
  ): Promise<PaginateRewardRequestsResponseDto> {
    return this.rewardRequestService.paginateRewardRequests(event);
  }

  @MessagePattern('reward_request_get_reward_request_by_id')
  async getRewardRequestById(@Payload() event: any): Promise<any> {
    return this.rewardRequestService.getRewardRequestById(event);
  }

  // NOTE: Endpoint 는 event 서버에 있지만, 로직 분리를 위해 reward-request 서버에서 처리
  @MessagePattern('event_create_event_reward_request')
  async createEventRewardRequest(
    @Payload() event: any,
  ): Promise<CreateEventRewardRequestResponseDto> {
    return this.rewardRequestService.createEventRewardRequest(event);
  }
}
