import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import {
  CreateEventRequestDto,
  CreateEventResponseDto,
} from '@lib/dtos/event/create-event.dto';
import { AuthActant } from '@lib/types/actant.type';
import { plainToClass, plainToInstance } from 'class-transformer';
import { GetEventByIdResponseDto } from '@lib/dtos/event/get-event-by-id.dto';
import {
  UpdateEventRequestDto,
  UpdateEventResponseDto,
} from '@lib/dtos/event/update-event.dto';
import { SoftDeleteEventResponseDto } from '@lib/dtos/event/soft-delete-event.dto';
import {
  PaginateEventsRequestDto,
  PaginateEventsResponseDto,
} from '@lib/dtos/event/paginate-events.dto';
import { EventDto } from '@lib/dtos/event/event.dto';
import { EventDocument } from './schemas/event.schema';
import { PaginationResponseDto } from '@lib/dtos/common/pagination.dto';
import { CreateEventRewardRequestResponseDto } from '@lib/dtos/event/create-event-reward-request.dto';
import { EventStatusType } from '@lib/enums/event-status-type.enum';
import {
  RewardRequest,
  RewardRequestDocument,
} from '../reward-request/schemas/reward-request.schema';
import { Reward, RewardDocument } from '../reward/schemas/reward.schema';
import { RewardRequestStatusType } from '@lib/enums/reward-request-status-type.enum';
import { EventConditionType } from '@lib/enums/event-condition-type-enum';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<EventDocument>,
    @InjectModel(RewardRequest.name)
    private readonly rewardRequestModel: Model<RewardRequestDocument>,
    @InjectModel(Reward.name)
    private readonly rewardModel: Model<RewardDocument>,
  ) {}

  async paginateEvents(req: {
    paginateEventsRequestDto: PaginateEventsRequestDto;
  }): Promise<PaginateEventsResponseDto> {
    const { paginateEventsRequestDto } = req;
    const {
      status,
      startDate,
      endDate,
      name,
      page = 1,
      rpp = 10,
    } = paginateEventsRequestDto;

    const filter: FilterQuery<EventDocument> = {};

    if (status) {
      filter['status'] = status;
    }
    if (startDate) {
      filter['startDate'] = { $gte: startDate };
    }
    if (endDate) {
      filter['endDate'] = { $lte: endDate };
    }
    if (name) {
      filter['name'] = { $regex: name, $options: 'i' };
    }

    const skip = (page - 1) * rpp;
    const events = await this.eventModel
      .find(filter)
      .sort({ id: -1 })
      .skip(skip)
      .limit(rpp)
      .exec();
    const total = await this.eventModel.countDocuments(filter).exec();
    const items = events.map((event) => plainToInstance(EventDto, event));

    return PaginationResponseDto.create(items, total, page, rpp);
  }

  async createEvent(req: {
    actant: AuthActant;
    createEventRequestDto: CreateEventRequestDto;
  }): Promise<CreateEventResponseDto> {
    const { actant, createEventRequestDto } = req;

    const createdEvent = await new this.eventModel(
      createEventRequestDto,
    ).save();

    return plainToInstance(CreateEventResponseDto, createdEvent);
  }

  async getEventById(req: { id: string }): Promise<GetEventByIdResponseDto> {
    const { id } = req;

    const event = await this.eventModel.findById(id).exec();

    if (!event) {
      throw new Error(`Event Not Found id: ${id}`);
    }

    return plainToInstance(GetEventByIdResponseDto, event);
  }

  async updateEvent(req: {
    actant: AuthActant;
    id: string;
    updateEventRequestDto: UpdateEventRequestDto;
  }): Promise<UpdateEventResponseDto> {
    const { actant, id, updateEventRequestDto } = req;

    const updatedEvent = await this.eventModel
      .findByIdAndUpdate(id, updateEventRequestDto, { new: true })
      .exec();

    if (!updatedEvent) {
      throw new Error(`Event Not Found id: ${id}`);
    }

    return plainToInstance(UpdateEventResponseDto, updatedEvent);
  }

  async softDeleteEvent(req: {
    actant: AuthActant;
    id: string;
  }): Promise<SoftDeleteEventResponseDto> {
    const { actant, id } = req;

    const deletedEvent = await this.eventModel.findByIdAndDelete(id).exec();

    if (!deletedEvent) {
      throw new Error(`Event Not Found id: ${id}`);
    }

    return plainToClass(SoftDeleteEventResponseDto, deletedEvent);
  }

  async createEventRewardRequest(req: {
    actant: AuthActant;
    id: string;
    createEventRewardRequestDto: CreateEventRewardRequestResponseDto;
  }): Promise<CreateEventRewardRequestResponseDto> {
    const { actant, id } = req;

    const event = await this.eventModel.findById(id).exec();

    if (!event) {
      throw new Error(`Event Not Found id: ${id}`);
    }

    if (event.status === EventStatusType.INACTIVE) {
      throw new Error(`Event is inactive id: ${id}`);
    }

    const now = new Date();

    if (event.startDate > now) {
      throw new Error(`Event not started: ${id}`);
    }

    if (event.endDate < now) {
      throw new Error(`Event already ended: ${id}`);
    }

    const existingRequest = await this.rewardRequestModel.findOne({
      userId: actant.user.id,
      eventId: id,
    });

    if (existingRequest) {
      throw new Error(`Reward request already exists for event: ${id}`);
    }

    const userActivities = [];

    const isRewardable = this.getQualificationData(event, userActivities);
    const rewards = await this.rewardModel.find({
      eventId: id,
    });

    const rewardRequest = await this.rewardRequestModel.create({
      userId: actant.user.id,
      eventId: id,
      qualificationData: {
        isRewardable,
        userActivities,
      },
      status: isRewardable
        ? RewardRequestStatusType.APPROVED
        : RewardRequestStatusType.REJECTED,
      rewards: isRewardable
        ? rewards.map((reward) => ({
            rewardId: reward._id,
            type: reward.type,
            quantity: reward.quantity,
            itemId: reward.itemId,
            description: reward.description,
            delivered: false,
            deliveredAt: now,
          }))
        : [],
      requestedAt: now,
    });

    return plainToInstance(CreateEventRewardRequestResponseDto, rewardRequest);
  }

  private getQualificationData(
    event: EventDocument,
    userActivities: any[],
  ): boolean {
    return event.conditions.every((condition) => {
      switch (condition.type) {
        case EventConditionType.USER_INVITE: {
          const inviteCount = userActivities.filter(
            (act) => act.type === 'INVITE',
          ).length;

          return inviteCount >= Number(condition.value);
        }
        case EventConditionType.LOGIN_CONSECUTIVE_DAYS: {
          const loginDays = userActivities
            .filter((act) => act.type === 'LOGIN')
            .map((act) => new Date(act.createdAt).toISOString().split('T')[0]); // TODO: userActivity 타입 지정후 로직 개선

          const uniqueDays = [...new Set(loginDays)].sort();

          // 연속된 날짜 계산
          let maxConsecutiveDays = 0;
          let currentConsecutiveDays = 1;

          for (let i = 1; i < uniqueDays.length; i++) {
            const date1 = new Date(uniqueDays[i - 1]);
            const date2 = new Date(uniqueDays[i]);

            // 하루 차이인지 확인
            const diffTime = Math.abs(date2.getTime() - date1.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
              currentConsecutiveDays++;
            } else {
              // 연속이 끊겼으므로 최대값 업데이트 후 초기화
              maxConsecutiveDays = Math.max(
                maxConsecutiveDays,
                currentConsecutiveDays,
              );
              currentConsecutiveDays = 1;
            }
          }

          // 마지막 연속 일수도 확인
          maxConsecutiveDays = Math.max(
            maxConsecutiveDays,
            currentConsecutiveDays,
          );

          const isRewardable = maxConsecutiveDays >= Number(condition.value);

          return isRewardable;
        }
        case EventConditionType.LOGIN_AT: {
          const loginAtDate = new Date(condition.value)
            .toISOString()
            .split('T')[0];
          const loginAtCount = userActivities.filter(
            (act) =>
              act.type === 'LOGIN' &&
              new Date(act.createdAt).toISOString().split('T')[0] ===
                loginAtDate,
          ).length;

          return loginAtCount > 0;
        }
        case EventConditionType.QUEST_CLEAR_COUNT: {
          const questClearCount = userActivities.filter(
            (act) => act.type === 'QUEST_CLEAR',
          ).length;

          return questClearCount >= Number(condition.value);
        }
        case EventConditionType.QUEST_CLEAR_SPECIFIC: {
          const questClearCount = userActivities.filter(
            (act) =>
              act.type === 'QUEST_CLEAR' && act.questId === condition.value,
          ).length;

          return questClearCount > 0;
        }
        default:
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          throw new Error(`Unknown condition type: ${condition.type}`);
      }
    });
  }
}
