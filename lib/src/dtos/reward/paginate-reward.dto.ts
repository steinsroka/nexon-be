import {
  PaginationRequestDto,
  PaginationResponseDto,
} from '../common/pagination.dto';
import { RewardDto } from './reward.dto';

export class PaginateRewardsRequestDto extends PaginationRequestDto {}
export class PaginateRewardsResponseDto extends PaginationResponseDto<RewardDto> {}
