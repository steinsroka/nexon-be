import { RewardRequestStatusType } from '@lib/enums/reward-request-status-type.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import {
  PaginationRequestDto,
  PaginationResponseDto,
} from '../common/pagination.dto';
import { RewardRequestDto } from './reward-request.dto';

export class PaginateRewardRequestsRequestDto extends PaginationRequestDto {
  @ApiProperty({
    description: '이벤트 ID',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  eventId: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: '리워드 요청 상태',
    required: false,
    enum: [RewardRequestStatusType],
  })
  statuses?: RewardRequestStatusType[];

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: '리워드 요청자 ID',
    required: false,
    type: String,
  })
  userId?: string;
}

export class PaginateRewardRequestsResponseDto extends PaginationResponseDto<RewardRequestDto> {}
