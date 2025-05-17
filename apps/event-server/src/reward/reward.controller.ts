import { CreateRewardResponseDto } from '@lib/dtos/reward/create-reward.dto';
import { UpdateRewardResponseDto } from '@lib/dtos/reward/update-reward.dto';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RewardService } from './reward.service';

@Controller()
export class RewardController {
  constructor(private readonly rewardService: RewardService) {}

  @MessagePattern('reward_create_reward')
  async createReward(@Payload() data: any): Promise<CreateRewardResponseDto> {
    return this.rewardService.createReward(data);
  }

  @MessagePattern('reward_update_reward')
  async updateReward(@Payload() data: any): Promise<UpdateRewardResponseDto> {
    return this.rewardService.updateReward(data);
  }
}
