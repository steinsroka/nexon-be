import {
  CreateRewardRequestDto,
  CreateRewardResponseDto,
} from '@lib/dtos/reward/create-reward.dto';
import {
  UpdateRewardRequestDto,
  UpdateRewardResponseDto,
} from '@lib/dtos/reward/update-reward.dto';
import { EventStatusType } from '@lib/enums/event-status-type.enum';
import { AuthActant } from '@lib/types/actant.type';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model } from 'mongoose';
import { EventDocument } from '../event/schemas/event.schema';
import { Reward, RewardDocument } from './schemas/reward.schema';

@Injectable()
export class RewardService {
  constructor(
    @InjectModel(Event.name)
    private readonly eventModel: Model<EventDocument>,
    @InjectModel(Reward.name)
    private readonly rewardModel: Model<RewardDocument>,
  ) {}

  async createReward(req: {
    actant: AuthActant;
    eventId: string;
    createRewardRequestDto: CreateRewardRequestDto;
  }): Promise<CreateRewardResponseDto> {
    const { actant, eventId, createRewardRequestDto } = req;

    const event = await this.eventModel.findById(eventId).exec();

    if (!event) {
      throw new Error(`Event Not Found id: ${eventId}`);
    }

    if (event.status !== EventStatusType.ACTIVE) {
      throw new Error(`Event Not Active id: ${eventId}`);
    }

    const createdReward = await new this.rewardModel({
      ...createRewardRequestDto,
      eventId,
    }).save();

    return plainToInstance(CreateRewardResponseDto, createdReward);
  }

  async updateReward(req: {
    actant: AuthActant;
    eventId: string;
    id: string;
    updateRewardRequestDto: UpdateRewardRequestDto;
  }): Promise<UpdateRewardResponseDto> {
    const { actant, eventId, id, updateRewardRequestDto } = req;

    const event = await this.eventModel.findById(eventId).exec();

    if (!event) {
      throw new Error(`Event Not Found id: ${eventId}`);
    }

    if (event.status !== EventStatusType.ACTIVE) {
      throw new Error(`Event Not Active id: ${eventId}`);
    }

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
