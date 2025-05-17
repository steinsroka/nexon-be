import {
  CreateRewardRequestDto,
  CreateRewardResponseDto,
} from '@lib/dtos/reward/create-reward.dto';
import { GetRewardByIdResponseDto } from '@lib/dtos/reward/get-reward-by-id.dto';
import {
  PaginateRewardsRequestDto,
  PaginateRewardsResponseDto,
} from '@lib/dtos/reward/paginate-reward.dto';
import {
  UpdateRewardRequestDto,
  UpdateRewardResponseDto,
} from '@lib/dtos/reward/update-reward-request.dto';
import { AuthActant } from '@lib/types/actant.type';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaginationResponseDto } from '@lib/dtos/common/pagination.dto';
import { RewardDto } from '@lib/dtos/reward/reward.dto';
import { plainToInstance } from 'class-transformer';
import { Reward, RewardDocument } from './schemas/reward.schema';

@Injectable()
export class RewardService {
  constructor(
    @InjectModel(Reward.name)
    private readonly rewardModel: Model<RewardDocument>,
  ) {}

  async paginateRewards(req: {
    actant: AuthActant;
    paginateRewardsRequestDto: PaginateRewardsRequestDto;
  }): Promise<PaginateRewardsResponseDto> {
    const { paginateRewardsRequestDto } = req;
    const { page = 1, rpp = 10 } = paginateRewardsRequestDto;

    const skip = (page - 1) * rpp;
    const rewards = await this.rewardModel.find().skip(skip).limit(rpp).exec();
    const total = await this.rewardModel.countDocuments().exec();
    const items = rewards.map((reward) => plainToInstance(RewardDto, reward));

    return PaginationResponseDto.create(items, total, page, rpp);
  }

  async createReward(req: {
    actant: AuthActant;
    createRewardRequestDto: CreateRewardRequestDto;
  }): Promise<CreateRewardResponseDto> {
    const { createRewardRequestDto } = req;

    const createdReward = await new this.rewardModel(
      createRewardRequestDto,
    ).save();

    return plainToInstance(CreateRewardResponseDto, createdReward);
  }

  async getRewardById(req: {
    actant: AuthActant;
    id: string;
  }): Promise<GetRewardByIdResponseDto> {
    const { id } = req;
    const reward = await this.rewardModel.findById(id).exec();

    if (!reward) {
      throw new Error(`Reward Not Found id: ${id}`);
    }

    return plainToInstance(GetRewardByIdResponseDto, reward);
  }

  async updateReward(req: {
    actant: AuthActant;
    id: string;
    updateRewardRequestDto: UpdateRewardRequestDto;
  }): Promise<UpdateRewardResponseDto> {
    const { id, updateRewardRequestDto } = req;

    const updatedReward = await this.rewardModel
      .findByIdAndUpdate(id, updateRewardRequestDto, {
        new: true,
      })
      .exec();

    if (!updatedReward) {
      throw new Error(`Reward Not Found id: ${id}`);
    }

    return plainToInstance(UpdateRewardResponseDto, updatedReward);
  }
}
