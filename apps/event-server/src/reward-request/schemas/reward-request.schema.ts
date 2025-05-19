import { RewardRequestStatusType } from '@lib/enums/reward-request-status-type.enum copy';
import { RewardTransactionStatusType } from '@lib/enums/reward-transaction-status-type.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ _id: false })
export class RewardTransaction {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  rewardId: MongooseSchema.Types.ObjectId;

  @Prop({
    default: RewardTransactionStatusType.PENDING,
    enum: RewardTransactionStatusType,
  })
  status: RewardTransactionStatusType;

  @Prop({ default: Date.now() })
  transactedAt: Date;
}

export type RewardRequestDocument = RewardRequest & Document;

@Schema({ timestamps: true })
export class RewardRequest {
  _id: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Event', required: true })
  eventId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  isRewardable: boolean;

  @Prop({
    default: RewardRequestStatusType.REQUESTED,
    enum: RewardRequestStatusType,
  })
  status: RewardRequestStatusType;

  @Prop({ type: [RewardTransaction] })
  rewardTransaction: RewardTransaction[];

  @Prop({ default: null })
  failReason: string;

  @Prop({ default: Date.now() })
  requestedAt: Date;
}

export const RewardRequestSchema = SchemaFactory.createForClass(RewardRequest);

RewardRequestSchema.index({ userId: 1, eventId: 1 }, { unique: true });
RewardRequestSchema.index({ status: 1 });
