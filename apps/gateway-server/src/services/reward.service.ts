import {
  CreateRewardRequestDto,
  CreateRewardResponseDto,
} from '@lib/dtos/reward/create-reward.dto';
import {
  UpdateRewardRequestDto,
  UpdateRewardResponseDto,
} from '@lib/dtos/reward/update-reward-request.dto';
import { AuthActant } from '@lib/types/actant.type';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BaseService } from './base.service';

@Injectable()
export class RewardService extends BaseService {
  constructor(
    @Inject('EVENT_SERVICE') private readonly eventServiceClient: ClientProxy,
    // @Inject('REWARD_SERVICE') private readonly eventServiceClient: ClientProxy,
  ) {
    super(eventServiceClient);
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
