import { Controller } from '@nestjs/common';
import { RewardRequestService } from './reward-request.service';

@Controller()
export class RewardRequestController {
  constructor(private readonly rewardRequestService: RewardRequestService) {}
}
