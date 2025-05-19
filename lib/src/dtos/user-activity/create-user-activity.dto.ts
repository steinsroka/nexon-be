import { UserActivityType } from '@lib/enums/user-activity-type-enum';
import { ApiProperty } from '@nestjs/swagger';
import { UserActivityDto } from './user-activity.dto';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ActivityMetadata } from '@lib/types/activity-metadata.type';

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
  @IsString()
  @IsOptional()
  metadata: ActivityMetadata;
}

export class CreateUserActivityResponseDto extends UserActivityDto {}
