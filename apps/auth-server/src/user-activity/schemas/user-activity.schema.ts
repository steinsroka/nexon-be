import { UserActivityType } from '@lib/enums/user-activity-type-enum';
import { ActivityMetadata } from '@lib/types/activity-metadata.type';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type UserActivityDocument = UserActivity & Document;

@Schema({ timestamps: true })
export class UserActivity {
  _id: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, enum: UserActivityType })
  type: UserActivityType;

  @Prop({ type: MongooseSchema.Types.Mixed, required: false })
  metadata: ActivityMetadata;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const UserActivitySchema = SchemaFactory.createForClass(UserActivity);

UserActivitySchema.index({ userId: 1 });
