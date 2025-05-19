import { Roles } from '@lib/decorators';
import {
  CreateRewardRequestDto,
  CreateRewardResponseDto,
} from '@lib/dtos/reward/create-reward.dto';
import {
  UpdateRewardRequestDto,
  UpdateRewardResponseDto,
} from '@lib/dtos/reward/update-reward.dto';
import { UserRoleType } from '@lib/enums';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../../../../lib/src/guards/roles.guard';
import { Serializer } from '@lib/interceptors';
import { Body, Controller, Param, Post, Put, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RewardService } from '../services/reward.service';

@ApiTags('rewards')
@Controller('events/:event_id/rewards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoleType.OPERATOR, UserRoleType.ADMIN)
export class RewardController {
  constructor(private readonly rewardService: RewardService) {}

  @Post()
  @ApiOperation({ summary: '이벤트에 리워드 추가' })
  @ApiResponse({
    status: 201,
    description: '리워드 생성 성공',
    type: CreateRewardResponseDto,
  })
  @Serializer(CreateRewardResponseDto)
  async createReward(
    @Param('event_id') eventId: string,
    @Body() createRewardRequestDto: CreateRewardRequestDto,
  ): Promise<CreateRewardResponseDto> {
    return this.rewardService.createReward(eventId, createRewardRequestDto);
  }

  @Put(':id') // TODO: Patch??
  @ApiOperation({ summary: '리워드 수정' })
  @ApiResponse({
    status: 200,
    description: '리워드 수정 성공',
    type: UpdateRewardResponseDto,
  })
  @Serializer(UpdateRewardResponseDto)
  async updateReward(
    @Param('event_id') eventId: string,
    @Param('id') id: string,
    @Body() updateRewardRequestDto: UpdateRewardRequestDto,
  ): Promise<UpdateRewardResponseDto> {
    return this.rewardService.updateReward(eventId, id, updateRewardRequestDto);
  }
}
