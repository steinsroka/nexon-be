import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventDocument } from './schemas/event.schemas';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<EventDocument>,
  ) {}

  async paginateEvents(req: {
    status?: string;
    startDate?: Date;
    endDate?: Date;
    name?: string;
    page: number;
    rpp: number;
  }): Promise<{
    events: EventDocument[];
    total: number;
    page: number;
    rpp: number;
  }> {
    const { status, startDate, endDate, name, page = 1, rpp = 10 } = req;

    const filter = {};
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
      .skip(skip)
      .limit(rpp)
      .exec();
    const total = await this.eventModel.countDocuments().exec();

    return { events, total, page, rpp };
  }

  async createEvent(req: any): Promise<any> {
    const createdEvent = new this.eventModel(req);
    return createdEvent.save();
  }

  async getEventById(req: { id: string }): Promise<any> {
    const { id } = req;

    const event = await this.eventModel.findById(id).exec();
    if (!event) {
      throw new Error(`Event Not Found id: ${id}`);
    }

    return event;
  }

  async updateEvent(req: { id: string; updateEventDto: any }): Promise<any> {
    const { id, updateEventDto } = req;

    const updatedEvent = await this.eventModel
      .findByIdAndUpdate(id, updateEventDto, { new: true })
      .exec();

    if (!updatedEvent) {
      throw new Error(`Event Not Found id: ${id}`);
    }

    return updatedEvent;
  }

  async softDeleteEvent(req: { id: string }): Promise<any> {
    const { id } = req;

    const deletedEvent = await this.eventModel.findByIdAndDelete(id).exec();

    if (!deletedEvent) {
      throw new Error(`Event Not Found id: ${id}`);
    }

    return deletedEvent;
  }
}
