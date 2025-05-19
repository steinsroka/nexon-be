import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventModule } from '../event/event.module';
import { RewardController } from './reward.controller';
import { RewardService } from './reward.service';
import { Reward, RewardSchema } from './schemas/reward.schema';

@Module({
  imports: [
    EventModule,
    MongooseModule.forFeature([
      { name: Reward.name, schema: RewardSchema, collection: 'rewards' },
    ]),
  ],
  controllers: [RewardController],
  providers: [RewardService],
  exports: [RewardService],
})
export class RewardModule {}
