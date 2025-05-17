import {
  PAGINATION_DEFAULT_PAGE,
  PAGINATION_MAX_RPP,
  PAGINATION_MIN_RPP,
} from '@lib/constants/common.constant';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, Max, Min } from 'class-validator';

export class PaginationParam {
  @ApiProperty({ description: '페이지', default: PAGINATION_DEFAULT_PAGE })
  @IsNumber()
  @Min(PAGINATION_DEFAULT_PAGE)
  @Type(() => Number)
  page: number; // NOTE: 페이지당 가져올 아이템 수

  @ApiProperty({
    description: '페이지당 아이템 수',
    default: PAGINATION_MIN_RPP,
  })
  @IsNumber()
  @Min(PAGINATION_MIN_RPP)
  @Max(PAGINATION_MAX_RPP)
  @Type(() => Number)
  rpp: number; // NOTE: 마지막 아이템 ID
}
