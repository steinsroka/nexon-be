import {
  CreateRewardRequestDto,
  CreateRewardResponseDto,
} from '@lib/dtos/reward/create-reward.dto';
import {
  UpdateRewardRequestDto,
  UpdateRewardResponseDto,
} from '@lib/dtos/reward/update-reward.dto';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RewardService } from './reward.service';

@Controller()
export class RewardController {
  constructor(private readonly rewardService: RewardService) {}

  @MessagePattern('reward_create_reward')
  async createReward(
    @Payload()
    data: {
      eventId: string;
      createRewardRequestDto: CreateRewardRequestDto;
    },
  ): Promise<CreateRewardResponseDto> {
    return this.rewardService.createReward(data);
  }

  @MessagePattern('reward_update_reward')
  async updateReward(
    @Payload()
    data: {
      eventId: string;
      id: string;
      updateRewardRequestDto: UpdateRewardRequestDto;
    },
  ): Promise<UpdateRewardResponseDto> {
    return this.rewardService.updateReward(data);
  }
}
