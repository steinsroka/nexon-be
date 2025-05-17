import { RewardRequestStatusType } from '@lib/enums/reward-request-status-type.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class QualificationDataDto {
  @ApiProperty({
    description: '리워드 요청 자격 여부',
    type: Boolean,
    example: true,
  })
  @Expose()
  isRewarable: boolean;

  @ApiProperty({
    description: '리워드 요청 자격을 위한 사용자 활동',
    type: [String],
    example: ['activity1', 'activity2'],
  })
  @Expose()
  userActivities: string[];
}

export class RewardStatus {
  @ApiProperty({
    description: '리워드 ID',
    type: String,
    example: 'rewardId',
  })
  @Expose()
  rewardId: string;

  @ApiProperty({
    description: '리워드 타입',
    type: String,
    example: 'type',
  })
  @Expose()
  type: string;

  @ApiProperty({
    description: '리워드 수량',
    type: Number,
    example: 1,
  })
  @Expose()
  quantity: number;

  @ApiProperty({
    description: '아이템 ID (선택적)',
    type: String,
    example: 'itemId',
  })
  @Expose()
  itemId?: string;

  @ApiProperty({
    description: '리워드 설명',
    type: String,
    example: 'description',
  })
  @Expose()
  description: string;

  @ApiProperty({
    description: '전달 여부',
    type: Boolean,
    example: false,
  })
  @Expose()
  delivered?: boolean;

  @ApiProperty({
    description: '전달 날짜 (선택적)',
    type: Date,
    example: new Date(),
  })
  @Expose()
  deliveredAt?: Date;
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
    description: '리워드 요청 자격 데이터',
    type: QualificationDataDto,
  })
  @Expose()
  @Type(() => QualificationDataDto)
  qualificationData: QualificationDataDto;

  @ApiProperty({
    description: '리워드 요청 상태',
    type: String,
    example: 'REQUESTED',
  })
  @Expose()
  status: RewardRequestStatusType;

  @ApiProperty({
    description: '리워드 상태',
    type: [RewardStatus],
  })
  @Expose()
  @Type(() => Array<RewardStatus>)
  rewards: RewardStatus[];

  @ApiProperty({
    description: '리워드 요청 생성 날짜',
    type: Date,
    example: new Date(),
  })
  @Expose()
  requestedAt: Date;
}
