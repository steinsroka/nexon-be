import { EventStatusType } from '@lib/enums/event-status-type.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EventDocument = Event & Document;

@Schema({ _id: false })
export class Condition {
  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  value: number;

  @Prop()
  description: string;
}

export const ConditionSchema = SchemaFactory.createForClass(Condition);

@Schema({ timestamps: true })
export class Event {
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: EventStatusType.ACTIVE, enum: EventStatusType })
  status: EventStatusType;

  @Prop({ type: [ConditionSchema], default: [] })
  conditions: Condition[];

  @Prop()
  createdBy: string;

  @Prop({ default: Date.now() })
  createdAt: Date;

  @Prop({ default: null })
  updatedAt: Date; // TODO: 이거 붙어서 나오는 경우가 있는데 왜그런지 확인필요

  @Prop({ default: null })
  deletedAt: Date;

  //TODO: 활성 / 비활성 칼럼 추가
}

export const EventSchema = SchemaFactory.createForClass(Event);

// 인덱스 추가
EventSchema.index({ status: 1, startDate: 1, endDate: 1 });
EventSchema.index({ name: 'text' });
