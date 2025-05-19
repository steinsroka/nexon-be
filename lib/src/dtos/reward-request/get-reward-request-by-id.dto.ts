import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  RewardRequestSummaryDto,
  RewardTransactionDto,
} from './reward-request.dto';

export class GetRewardRequestSummaryByIdResponseDto extends RewardRequestSummaryDto {
  @ApiProperty({
    description: '리워드 트랜잭션 정보',
    type: [RewardTransactionDto],
  })
  @Expose()
  @Type(() => RewardTransactionDto)
  rewardTransactions: RewardTransactionDto[];
}
