import {
  PAGINATION_DEFAULT_PAGE,
  PAGINATION_MAX_RPP,
  PAGINATION_MIN_RPP,
} from '@lib/constants/common.constant';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, Max, Min } from 'class-validator';

export class PaginationRequestDto {
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

export class PaginationResponseDto<T> {
  @ApiProperty({ description: '데이터 목록' })
  items: T[];

  @ApiProperty({ description: '총 아이템 수' })
  total: number;

  @ApiProperty({ description: '페이지' })
  page: number;

  @ApiProperty({ description: '페이지당 아이템 수' })
  rpp: number;

  constructor(items: T[], total: number, page: number, rpp: number) {
    this.items = items;
    this.total = total;
    this.page = page;
    this.rpp = rpp;
  }

  static create<T>(
    items: T[],
    total: number,
    page: number,
    rpp: number,
  ): PaginationResponseDto<T> {
    return new PaginationResponseDto<T>(items, total, page, rpp);
  }
}
