import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BaseService } from './base.service';
import { AuthActant } from '@lib/types/actant.type';
import {
  PaginateRewardsRequestDto,
  PaginateRewardsResponseDto,
} from '@lib/dtos/reward/paginate-reward.dto';
import {
  CreateRewardRequestDto,
  CreateRewardResponseDto,
} from '@lib/dtos/reward/create-reward.dto';
import { GetRewardByIdResponseDto } from '@lib/dtos/reward/get-reward-by-id.dto';
import {
  UpdateRewardRequestDto,
  UpdateRewardResponseDto,
} from '@lib/dtos/reward/update-reward-request.dto';

@Injectable()
export class RewardService extends BaseService {
  constructor(
    @Inject('EVENT_SERVICE') private readonly eventServiceClient: ClientProxy,
    // @Inject('REWARD_SERVICE') private readonly eventServiceClient: ClientProxy,
  ) {
    super(eventServiceClient);
  }

  async paginateRewards(req: {
    actant: AuthActant;
    paginateRewardsRequestDto: PaginateRewardsRequestDto;
  }): Promise<PaginateRewardsResponseDto> {
    const resp = await this.sendRequest<PaginateRewardsResponseDto>(
      'reward_paginate_rewards',
      req,
    );

    return resp;
  }

  async createReward(req: {
    actant: AuthActant;
    createRewardRequestDto: CreateRewardRequestDto;
  }): Promise<CreateRewardResponseDto> {
    const resp = await this.sendRequest<CreateRewardResponseDto>(
      'reward_create_reward',
      req,
    );

    return resp;
  }

  async getRewardById(req: {
    actant: AuthActant;
    id: string;
  }): Promise<GetRewardByIdResponseDto> {
    const resp = await this.sendRequest<GetRewardByIdResponseDto>(
      'reward_get_reward_by_id',
      req,
    );

    return resp;
  }

  async updateReward(req: {
    actant: AuthActant;
    id: string;
    updateRewardRequestDto: UpdateRewardRequestDto;
  }): Promise<UpdateRewardResponseDto> {
    const resp = await this.sendRequest<UpdateRewardResponseDto>(
      'reward_update_reward',
      req,
    );

    return resp;
  }
}
