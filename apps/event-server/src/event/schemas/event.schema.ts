import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE'] })
  status: string;

  @Prop({ type: [ConditionSchema], default: [] })
  conditions: Condition[];

  @Prop()
  createdBy: string;

  @Prop({ default: Date.now() })
  createdAt: Date;

  @Prop({ default: null })
  updatedAt: Date;

  @Prop({ default: null })
  deletedAt: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event);

// 인덱스 추가
EventSchema.index({ status: 1, startDate: 1, endDate: 1 });
EventSchema.index({ name: 'text' });
