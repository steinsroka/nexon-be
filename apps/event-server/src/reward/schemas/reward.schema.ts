import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type RewardDocument = Reward & Document;

@Schema({ timestamps: true })
export class Reward {
  _id: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Event', required: true })
  eventId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  type: string;

  @Prop()
  itemId?: string;

  @Prop({ required: true })
  quantity: number;

  @Prop()
  description: string;
}

export const RewardSchema = SchemaFactory.createForClass(Reward);

RewardSchema.index({ eventId: 1 });
