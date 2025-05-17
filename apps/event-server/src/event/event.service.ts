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

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<EventDocument>,
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
}
