import { RewardDto } from './../../../../../lib/src/dtos/reward/reward.dto';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EventDocument = Event & Document;
export type RewardDocument = RewardDto & Document;

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

@Schema({ _id: false })
// TODO: 매일 하나씩 주는 보상 같은건 어떻게 처리할건지?
// 특정 시각에 제공하는 보상은 어떻게 처리하는지?
export class Reward {
  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  value: number;

  @Prop()
  description: string;
}

export const RewardSchema = SchemaFactory.createForClass(Reward);

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

  @Prop({ type: [RewardSchema], default: [] })
  rewards: Reward[];

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
