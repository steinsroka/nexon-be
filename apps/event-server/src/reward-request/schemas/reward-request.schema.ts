import { RewardRequestStatusType } from '@lib/enums/reward-request-status-type.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ _id: false })
export class QualificationData {
  @Prop({ required: true })
  isRewardable: boolean;

  @Prop({ type: [MongooseSchema.Types.ObjectId] })
  userActivities: MongooseSchema.Types.ObjectId[];
}

@Schema({ _id: false })
export class RewardStatus {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Reward' })
  rewardId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  quantity: number;

  @Prop()
  itemId?: string;

  @Prop()
  description: string;

  @Prop({ default: false })
  delivered: boolean;

  @Prop()
  deliveredAt: Date;
}

export type RewardRequestDocument = RewardRequest & Document;

@Schema({ timestamps: true })
export class RewardRequest {
  _id: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Event', required: true })
  eventId: MongooseSchema.Types.ObjectId;

  @Prop({ type: QualificationData })
  qualificationData: QualificationData;

  @Prop({
    default: RewardRequestStatusType.REQUESTED,
    enum: RewardRequestStatusType,
  })
  status: string;

  @Prop({ type: [RewardStatus] })
  rewards: RewardStatus[];

  @Prop({ default: Date.now() })
  requestedAt: Date;
}

export const RewardRequestSchema = SchemaFactory.createForClass(RewardRequest);

RewardRequestSchema.index({ userId: 1, eventId: 1 });
RewardRequestSchema.index({ status: 1 });

// TODO: 자동으로 보상 지급? / 요청 해야만 지급?
// condition validation 하는 로직 고려해서 qualificationData 설계 개선
