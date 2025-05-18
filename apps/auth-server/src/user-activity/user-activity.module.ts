import { Module } from '@nestjs/common';
import { UserActivityService } from './user-activity.service';
import { UserActivityController } from './user-activity.controller';
import {
  UserActivity,
  UserActivitySchema,
} from './schemas/user-activity.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: UserActivity.name,
        schema: UserActivitySchema,
        collection: 'user_activities',
      },
    ]),
  ],
  controllers: [UserActivityController],
  providers: [UserActivityService],
  exports: [UserActivityService],
})
export class UserActivityModule {}
