import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RewardRequestController } from './reward-request.controller';
import { RewardRequestService } from './reward-request.service';
import {
  RewardRequest,
  RewardRequestSchema,
} from './schemas/reward-request.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: RewardRequest.name,
        schema: RewardRequestSchema,
        collection: 'reward_requests',
      },
    ]),
  ],

  controllers: [RewardRequestController],
  providers: [RewardRequestService],
})
export class RewardRequestModule {}
