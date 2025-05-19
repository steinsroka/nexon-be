import {
  CreateRewardRequestDto,
  CreateRewardResponseDto,
} from '@lib/dtos/reward/create-reward.dto';
import {
  UpdateRewardRequestDto,
  UpdateRewardResponseDto,
} from '@lib/dtos/reward/update-reward.dto';
import { EventStatusType } from '@lib/enums/event-status-type.enum';
import { RpcExceptionUtil } from '@lib/utils/rpc-exception.util';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model } from 'mongoose';
import { EventService } from '../event/event.service';
import { Reward, RewardDocument } from './schemas/reward.schema';

@Injectable()
export class RewardService {
  constructor(
    @InjectModel(Reward.name)
    private readonly rewardModel: Model<RewardDocument>,
    private readonly eventService: EventService,
  ) {}

  async createReward(req: {
    eventId: string;
    createRewardRequestDto: CreateRewardRequestDto;
  }): Promise<CreateRewardResponseDto> {
    const { eventId, createRewardRequestDto } = req;

    const event = await this.eventService.findEventById(eventId);

    if (!event) {
      throw RpcExceptionUtil.notFound(
        `이벤트를 찾을 수 없습니다 (ID: ${eventId})`,
        'EVENT_NOT_FOUND',
      );
    }

    if (event.status !== EventStatusType.ACTIVE) {
      throw RpcExceptionUtil.badRequest(
        `이벤트가 활성화 상태가 아닙니다 (ID: ${eventId})`,
        'EVENT_NOT_ACTIVE',
      );
    }

    const createdReward = await this.rewardModel.create({
      ...createRewardRequestDto,
      eventId,
    });

    return plainToInstance(CreateRewardResponseDto, createdReward);
  }

  async updateReward(req: {
    eventId: string;
    id: string;
    updateRewardRequestDto: UpdateRewardRequestDto;
  }): Promise<UpdateRewardResponseDto> {
    const { eventId, id, updateRewardRequestDto } = req;

    const event = await this.eventService.findEventById(eventId);

    if (!event) {
      throw RpcExceptionUtil.notFound(
        `이벤트를 찾을 수 없습니다 (ID: ${eventId})`,
        'EVENT_NOT_FOUND',
      );
    }

    if (event.status !== EventStatusType.ACTIVE) {
      throw RpcExceptionUtil.badRequest(
        `이벤트가 활성화 상태가 아닙니다 (ID: ${eventId})`,
        'EVENT_NOT_ACTIVE',
      );
    }

    const updatedReward = await this.rewardModel
      .findByIdAndUpdate(id, updateRewardRequestDto, {
        new: true,
      })
      .exec();

    if (!updatedReward) {
      throw RpcExceptionUtil.notFound(
        `보상을 찾을 수 없습니다 (ID: ${id})`,
        'REWARD_NOT_FOUND',
      );
    }

    return plainToInstance(UpdateRewardResponseDto, updatedReward);
  }

  async findRewardsByEventId(eventId: string): Promise<Reward[]> {
    const rewards = await this.rewardModel.find({ eventId }).exec();

    return rewards;
  }
}
