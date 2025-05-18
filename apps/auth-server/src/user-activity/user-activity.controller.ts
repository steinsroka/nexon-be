import { Controller } from '@nestjs/common';
import { UserActivityService } from './user-activity.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateUserActivityResponseDto } from '@lib/dtos/user-activity/create-user-activity.dto';

@Controller()
export class UserActivityController {
  constructor(private readonly userActivityService: UserActivityService) {}

  @MessagePattern('user_activity_create_user_activity')
  async createUserActivity(
    @Payload() data: any,
  ): Promise<CreateUserActivityResponseDto> {
    return this.userActivityService.createUserActivity(data);
  }

  @MessagePattern('user_activity_get_user_activities')
  async getUserActivities(@Payload() data: any): Promise<any> {
    return this.userActivityService.getUserActivities(data);
  }
}
