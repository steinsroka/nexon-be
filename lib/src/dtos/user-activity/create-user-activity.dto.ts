import { UserActivityType } from '@lib/enums/user-activity-type-enum';
import { ApiProperty } from '@nestjs/swagger';
import { UserActivityDto } from './user-activity.dto';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserActivityRequestDto {
  @ApiProperty({
    example: UserActivityType.LOGIN,
  })
  @IsEnum(UserActivityType)
  @IsNotEmpty()
  type: UserActivityType;

  @ApiProperty({
    example: '1',
  })
  @IsString()
  @IsOptional()
  value?: string;
}

export class CreateUserActivityResponseDto extends UserActivityDto {}
