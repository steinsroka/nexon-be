import { CreateUserActivityRequestDto } from './../../../../lib/src/dtos/user-activity/create-user-activity.dto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  UserActivity,
  UserActivityDocument,
} from './schemas/user-activity.schema';
import { plainToInstance } from 'class-transformer';
import { CreateUserActivityResponseDto } from '@lib/dtos/user-activity/create-user-activity.dto';
import { AuthActant } from '@lib/types';
import { UserRoleType } from '@lib/enums';

@Injectable()
export class UserActivityService {
  constructor(
    @InjectModel(UserActivity.name)
    private userActivityModel: Model<UserActivityDocument>,
  ) {}

  async createUserActivity(req: {
    actant?: AuthActant;
    userId: string;
    createUserActivityRequestDto: CreateUserActivityRequestDto;
  }): Promise<CreateUserActivityResponseDto> {
    const { actant, userId, createUserActivityRequestDto } = req;
    const { type, value } = createUserActivityRequestDto;

    if (actant?.user.role === UserRoleType.USER && actant?.user.id !== userId) {
      throw new UnauthorizedException('본인의 활동 기록만 추가할 수 있습니다.');
    }

    const newUserActivity = new this.userActivityModel({
      userId,
      type,
      value,
    });

    const savedUserActivity = await newUserActivity.save();

    return plainToInstance(CreateUserActivityResponseDto, savedUserActivity);
  }
}
