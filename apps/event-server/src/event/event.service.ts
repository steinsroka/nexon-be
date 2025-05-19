import { PaginationResponseDto } from '@lib/dtos/common/pagination.dto';
import {
  CreateEventRequestDto,
  CreateEventResponseDto,
} from '@lib/dtos/event/create-event.dto';
import { EventDto, EventSummaryDto } from '@lib/dtos/event/event.dto';
import { getEventSummaryByIdResponseDto } from '@lib/dtos/event/get-event-by-id.dto';
import {
  PaginateEventsRequestDto,
  PaginateEventsResponseDto,
} from '@lib/dtos/event/paginate-events.dto';
import { SoftDeleteEventResponseDto } from '@lib/dtos/event/soft-delete-event.dto';
import {
  UpdateEventRequestDto,
  UpdateEventResponseDto,
} from '@lib/dtos/event/update-event.dto';
import { CreateRewardRequestDto } from '@lib/dtos/reward/create-reward.dto';
import { RewardDto } from '@lib/dtos/reward/reward.dto';
import { RpcExceptionUtil } from '@lib/index';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToClass, plainToInstance } from 'class-transformer';
import { FilterQuery, Model } from 'mongoose';
import { Reward, RewardDocument } from '../reward/schemas/reward.schema';
import { Event, EventDocument } from './schemas/event.schema';
import * as dayjs from 'dayjs';
import { EventStatusType } from '@lib/enums/event-status-type.enum';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<EventDocument>,
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
    const items = events.map((event) => {
      return plainToInstance(EventDto, event, {
        enableCircularCheck: true,
        excludeExtraneousValues: true,
      });
    });

    return PaginationResponseDto.create(items, total, page, rpp);
  }

  async createEvent(req: {
    createEventRequestDto: CreateEventRequestDto;
  }): Promise<CreateEventResponseDto> {
    const { createEventRequestDto } = req;

    const { rewards, ...eventData } = createEventRequestDto;

    const createdEvent = await this.eventModel.create(eventData);

    // 이벤트 생성 후 관련 보상 생성
    if (rewards && rewards.length > 0) {
      await this.rewardModel.insertMany(
        rewards.map((reward: CreateRewardRequestDto) => {
          return {
            ...reward,
            eventId: createdEvent._id,
          };
        }),
        {
          ordered: false,
        },
      );
    }

    return plainToInstance(CreateEventResponseDto, createdEvent, {
      excludeExtraneousValues: true,
      enableCircularCheck: true,
    });
  }

  async getEventSummaryById(req: {
    id: string;
  }): Promise<getEventSummaryByIdResponseDto> {
    const { id } = req;

    const event = await this.findEventById(id);

    if (!event) {
      throw RpcExceptionUtil.notFound(
        `이벤트를 찾을 수 없습니다 (ID: ${id})`,
        'EVENT_NOT_FOUND',
      );
    }

    const rewards = await this.rewardModel.find({ eventId: id }).exec();

    const eventDto = plainToInstance(EventSummaryDto, event, {
      excludeExtraneousValues: true,
      enableCircularCheck: true,
    });

    eventDto.rewards = plainToInstance(RewardDto, rewards);

    return eventDto;
  }

  async updateEvent(req: {
    id: string;
    updateEventRequestDto: UpdateEventRequestDto;
  }): Promise<UpdateEventResponseDto> {
    const { id, updateEventRequestDto } = req;

    const updatedEvent = await this.eventModel
      .findByIdAndUpdate(id, updateEventRequestDto, { new: true })
      .exec();

    if (!updatedEvent) {
      throw RpcExceptionUtil.notFound(
        `이벤트를 찾을 수 없습니다 (ID: ${id})`,
        'EVENT_NOT_FOUND',
      );
    }

    return plainToInstance(UpdateEventResponseDto, updatedEvent, {
      excludeExtraneousValues: true,
      enableCircularCheck: true,
    });
  }

  async softDeleteEvent(req: {
    id: string;
  }): Promise<SoftDeleteEventResponseDto> {
    const { id } = req;

    const softDeletedEvent = await this.eventModel
      .findOneAndUpdate(
        {
          id,
          deletedAt: null,
        },
        {
          deletedAt: dayjs().toDate(),
          status: EventStatusType.INACTIVE,
        },
      )
      .exec();

    if (!softDeletedEvent) {
      throw RpcExceptionUtil.notFound(
        `이벤트를 찾을 수 없습니다 (ID: ${id})`,
        'EVENT_NOT_FOUND',
      );
    }

    const updatedEvent = await this.eventModel.findById(id).exec();

    return plainToClass(SoftDeleteEventResponseDto, updatedEvent, {
      excludeExtraneousValues: true,
      enableCircularCheck: true,
    });
  }

  async findEventById(id: string): Promise<EventDocument | null> {
    return await this.eventModel.findById(id).exec();
  }
}
