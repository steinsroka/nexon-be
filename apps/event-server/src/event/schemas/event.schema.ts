import { EventConditionType } from '@lib/enums/event-condition-type-enum';
import { EventStatusType } from '@lib/enums/event-status-type.enum';
import { ConditionMetadata } from '@lib/types/condition-metadata.type';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type EventDocument = Event & Document;

@Schema({ _id: false })
export class Condition {
  @Prop({ default: EventConditionType.USER_INVITE, enum: EventConditionType })
  type: EventConditionType;

  @Prop({ type: MongooseSchema.Types.Mixed, required: false })
  metadata: ConditionMetadata;

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
  updatedAt: Date;

  @Prop({ default: null })
  deletedAt: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event);

EventSchema.index({ status: 1, startDate: 1, endDate: 1, name: 1 });
