import { UserRoleType } from '@lib/enums';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({
    required: true,
    enum: Object.values(UserRoleType),
    default: UserRoleType.USER,
  })
  role: UserRoleType;

  @Prop({ type: String, default: null })
  refreshToken: string | null;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: null })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
