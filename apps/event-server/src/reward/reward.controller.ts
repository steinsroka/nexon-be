import { GetRewardByIdResponseDto } from './../../../../lib/src/dtos/reward/get-reward-by-id.dto';
import { Controller } from '@nestjs/common';
import { RewardService } from './reward.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PaginateRewardsResponseDto } from '@lib/dtos/reward/paginate-reward.dto';
import { CreateRewardResponseDto } from '@lib/dtos/reward/create-reward.dto';
import { UpdateRewardResponseDto } from '@lib/dtos/reward/update-reward-request.dto';

@Controller()
export class RewardController {
  constructor(private readonly rewardService: RewardService) {}

  @MessagePattern('reward_paginate_rewards')
  async paginateRewards(
    @Payload() data: any,
  ): Promise<PaginateRewardsResponseDto> {
    return this.rewardService.paginateRewards(data);
  }

  @MessagePattern('reward_create_reward')
  async createReward(@Payload() data: any): Promise<CreateRewardResponseDto> {
    return this.rewardService.createReward(data);
  }

  @MessagePattern('reward_get_reward_by_id')
  async getRewardById(@Payload() data: any): Promise<GetRewardByIdResponseDto> {
    return this.rewardService.getRewardById(data);
  }

  @MessagePattern('reward_update_reward')
  async updateReward(@Payload() data: any): Promise<UpdateRewardResponseDto> {
    return this.rewardService.updateReward(data);
  }
}
