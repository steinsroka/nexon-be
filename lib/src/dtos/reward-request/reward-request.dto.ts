import { RewardRequestStatusType } from '@lib/enums/reward-request-status-type.enum copy';
import { RewardTransactionStatusType } from '@lib/enums/reward-transaction-status-type.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { UserDto } from '../user/user.dto';
import { EventDto } from '../event/event.dto';

export class RewardTransactionDto {
  @ApiProperty({
    description: '리워드 ID',
    type: String,
    example: 'rewardId',
  })
  @Expose()
  rewardId: string;

  @ApiProperty({
    description: '리워드 지급 상태',
    enum: RewardTransactionStatusType,
    example: RewardTransactionStatusType.PENDING,
  })
  @Expose()
  status: RewardTransactionStatusType;

  @ApiProperty({
    description: '리워드 전달 날짜',
    type: Date,
    example: new Date(),
  })
  @Expose()
  transactedAt: Date;
}

export class RewardRequestDto {
  @ApiProperty({
    description: '리워드 요청 ID',
    type: String,
    example: 'rewardRequestId',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: '사용자 ID',
    type: String,
    example: 'userId',
  })
  @Expose()
  userId: string;

  @ApiProperty({
    description: '이벤트 ID',
    type: String,
    example: 'eventId',
  })
  @Expose()
  eventId: string;

  @ApiProperty({
    description: '리워드 요청 자격 여부',
    type: Boolean,
    example: true,
  })
  @Expose()
  isRewarable: boolean;

  @ApiProperty({
    description: '리워드 요청 상태',
    type: String,
    example: 'REQUESTED',
  })
  @Expose()
  status: RewardRequestStatusType;

  @ApiProperty({
    description: '리워드 상태',
    type: [RewardTransactionDto],
  })
  @Expose()
  @Type(() => Array<RewardTransactionDto>)
  rewards: RewardTransactionDto[];

  @ApiProperty({
    description: '리워드 요청 실패 사유',
    type: String,
    example: 'Failed due to insufficient points',
  })
  @Expose()
  failReason: string;

  @ApiProperty({
    description: '리워드 요청 생성 날짜',
    type: Date,
    example: new Date(),
  })
  @Expose()
  requestedAt: Date;
}

export class RewardRequestSummaryDto extends RewardRequestDto {
  @Expose()
  user: UserDto;

  @Expose()
  event: EventDto;
}
