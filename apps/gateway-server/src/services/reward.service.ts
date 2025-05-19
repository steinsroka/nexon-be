import {
  CreateRewardRequestDto,
  CreateRewardResponseDto,
} from '@lib/dtos/reward/create-reward.dto';
import {
  UpdateRewardRequestDto,
  UpdateRewardResponseDto,
} from '@lib/dtos/reward/update-reward.dto';
import { MicroServiceType } from '@lib/enums/microservice.enum';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { REQUEST } from '@nestjs/core';
import { BaseGatewayService } from './base.service';
@Injectable()
export class RewardService extends BaseGatewayService {
  constructor(
    @Inject(MicroServiceType.EVENT_SERVER)
    protected readonly eventServiceClient: ClientProxy,
    @Inject(REQUEST) protected readonly request: Request,
  ) {
    super(eventServiceClient, request);
  }

  async createReward(
    eventId: string,
    createRewardRequestDto: CreateRewardRequestDto,
  ): Promise<CreateRewardResponseDto> {
    return this.sendRequest<CreateRewardResponseDto>('reward_create_reward', {
      eventId,
      createRewardRequestDto,
    });
  }

  async updateReward(
    eventId: string,
    id: string,
    updateRewardRequestDto: UpdateRewardRequestDto,
  ): Promise<UpdateRewardResponseDto> {
    return this.sendRequest<UpdateRewardResponseDto>('reward_update_reward', {
      eventId,
      id,
      updateRewardRequestDto,
    });
  }

  protected getServiceType(): MicroServiceType {
    return MicroServiceType.EVENT_SERVER;
  }
}
