import { Controller } from '@nestjs/common';
import { UserActivityService } from './user-activity.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreateUserActivityRequestDto,
  CreateUserActivityResponseDto,
} from '@lib/dtos/user-activity/create-user-activity.dto';
import { AuthActant } from '@lib/types';
import { UserActivityDto } from '@lib/dtos/user-activity/user-activity.dto';

@Controller()
export class UserActivityController {
  constructor(private readonly userActivityService: UserActivityService) {}

  @MessagePattern('user_activity_create_user_activity')
  async createUserActivity(
    @Payload()
    data: {
      actant?: AuthActant;
      userId: string;
      createUserActivityRequestDto: CreateUserActivityRequestDto;
    },
  ): Promise<CreateUserActivityResponseDto> {
    return this.userActivityService.createUserActivity(data);
  }

  @MessagePattern('user_activity_get_user_activities')
  async getUserActivities(@Payload() data: { userId: string }): Promise<{
    userActivities: UserActivityDto[];
  }> {
    return this.userActivityService.getUserActivities(data);
  }
}
