import { PaginationResponseDto } from '@lib/dtos/common/pagination.dto';
import {
  CreateEventRequestDto,
  CreateEventResponseDto,
} from '@lib/dtos/event/create-event.dto';
import { EventDto } from '@lib/dtos/event/event.dto';
import { GetEventByIdResponseDto } from '@lib/dtos/event/get-event-by-id.dto';
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
        enableCircularCheck: true, // 순환 참조 감지 활성화
        excludeExtraneousValues: true, // @Expose 데코레이터가 있는 속성만 변환
      });
    });

    return PaginationResponseDto.create(items, total, page, rpp);
  }

  async createEvent(req: {
    createEventRequestDto: CreateEventRequestDto;
  }): Promise<CreateEventResponseDto> {
    const { createEventRequestDto } = req;

    // rewards 데이터를 제외한 이벤트 정보만 저장
    const { rewards, ...eventData } = createEventRequestDto;

    // 이벤트 생성
    const createdEvent = await new this.eventModel(eventData).save();

    // 이벤트 생성 후 관련 보상 생성
    if (rewards && rewards.length > 0) {
      const res = await this.rewardModel.insertMany(
        rewards.map((reward: CreateRewardRequestDto) => {
          return {
            ...reward,
            eventId: createdEvent._id,
          };
        }),
      );
    }

    return plainToInstance(CreateEventResponseDto, createdEvent, {
      excludeExtraneousValues: true,
      enableCircularCheck: true,
    });
  }

  async getEventById(req: { id: string }): Promise<GetEventByIdResponseDto> {
    const { id } = req;

    const event = await this.findEventById(id);

    if (!event) {
      throw RpcExceptionUtil.notFound(
        `이벤트를 찾을 수 없습니다 (ID: ${id})`,
        'EVENT_NOT_FOUND',
      );
    }

    const rewards = await this.rewardModel.find({ eventId: id }).exec();

    const eventDto = plainToInstance(EventDto, event, {
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

    return plainToInstance(UpdateEventResponseDto, updatedEvent);
  }

  async softDeleteEvent(req: {
    id: string;
  }): Promise<SoftDeleteEventResponseDto> {
    const { id } = req;

    const deletedEvent = await this.eventModel.findByIdAndDelete(id).exec();

    if (!deletedEvent) {
      throw RpcExceptionUtil.notFound(
        `이벤트를 찾을 수 없습니다 (ID: ${id})`,
        'EVENT_NOT_FOUND',
      );
    }

    return plainToClass(SoftDeleteEventResponseDto, deletedEvent);
  }

  async findEventById(id: string): Promise<EventDocument | null> {
    return await this.eventModel.findById(id).exec();
  }
}
