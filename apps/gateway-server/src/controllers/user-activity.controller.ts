import { Actant, Roles } from '@lib/decorators';
import {
  CreateUserActivityRequestDto,
  CreateUserActivityResponseDto,
} from '@lib/dtos/user-activity/create-user-activity.dto';
import { UserRoleType } from '@lib/enums';
import { JwtAuthGuard } from '@lib/guards';
import { RolesGuard } from '@lib/guards/roles.guard';
import { Serializer } from '@lib/interceptors';
import { AuthActant } from '@lib/types';
import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserActivityGatewayService } from './../services/user-activity-gateway.service';

@ApiTags('user-activities')
@Controller('user/:user_id/user-activity')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoleType.ADMIN, UserRoleType.USER)
export class UserActivityController {
  constructor(
    private readonly userActivityGatewayService: UserActivityGatewayService,
  ) {}

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
    return this.userActivityGatewayService.createUserActivity(
      actant,
      userId,
      createUserActivityRequestDto,
    );
  }
}
