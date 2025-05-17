import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RewardDocument = Reward & Document;

@Schema({ timestamps: true })
export class Reward {
  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  quantity: number;

  @Prop()
  itemId?: string;

  @Prop()
  description: string;
}

export const RewardSchema = SchemaFactory.createForClass(Reward);
