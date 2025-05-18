import { Actant, Roles } from '@lib/decorators';
import { UserRoleType } from '@lib/enums';
import { JwtAuthGuard } from '@lib/guards';
import { RolesGuard } from '@lib/guards/roles.guard';
import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GatewayService } from '../gateway.service';
import { AuthActant } from '@lib/types';
import { MicroServiceType } from '@lib/enums/microservice.enum';
import {
  CreateUserActivityRequestDto,
  CreateUserActivityResponseDto,
} from '@lib/dtos/user-activity/create-user-activity.dto';
import { Serializer } from '@lib/interceptors';

@ApiTags('user-activities')
@Controller('user/:user_id/user-activity')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoleType.ADMIN, UserRoleType.USER)
export class UserActivityController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Post()
  @ApiOperation({ summary: '유저 활동 생성 (유저, 관리자)' })
  @ApiResponse({
    status: 201,
    description: '유저 활동 생성 성공',
    type: CreateUserActivityResponseDto,
  })
  @Serializer(CreateUserActivityResponseDto)
  async createUserActivity(
    @Actant() actant: AuthActant,
    @Param('user_id') userId: string,
    @Body() createUserActivityRequestDto: CreateUserActivityRequestDto,
  ): Promise<CreateUserActivityResponseDto> {
    return this.gatewayService.sendRequest<CreateUserActivityResponseDto>(
      MicroServiceType.AUTH_SERVER,
      'user_activity_create_user_activity',
      { actant, userId, createUserActivityRequestDto },
    );
  }
}
