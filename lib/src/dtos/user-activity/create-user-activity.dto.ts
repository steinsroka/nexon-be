import { UserActivityType } from '@lib/enums/user-activity-type-enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { ActivityMetadata } from './../../types/activity-metadata.type';
import { UserActivityDto } from './user-activity.dto';

export class CreateUserActivityRequestDto {
  @ApiProperty({
    example: UserActivityType.LOGIN,
  })
  @IsEnum(UserActivityType)
  @IsNotEmpty()
  type: UserActivityType;

  @ApiProperty({
    example: { loginAt: new Date() },
  })
  @IsOptional()
  metadata: ActivityMetadata;
}

export class CreateUserActivityResponseDto extends UserActivityDto {}
