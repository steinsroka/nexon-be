import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RewardService } from '../services/reward.service';
import { Serializer } from '@lib/interceptors';
import { Actant, Roles } from '@lib/decorators';
import { UserRoleType } from '@lib/enums';
import { JwtAuthGuard } from '@lib/guards';
import { RolesGuard } from '@lib/guards/roles.guard';
import { AuthActant } from '@lib/types/actant.type';
import {
  PaginateRewardsResponseDto,
  PaginateRewardsRequestDto,
} from '@lib/dtos/reward/paginate-reward.dto';
import {
  CreateRewardResponseDto,
  CreateRewardRequestDto,
} from '@lib/dtos/reward/create-reward.dto';
import { GetRewardByIdResponseDto } from '@lib/dtos/reward/get-reward-by-id.dto';
import {
  UpdateRewardResponseDto,
  UpdateRewardRequestDto,
} from '@lib/dtos/reward/update-reward-request.dto';

@ApiTags('rewards')
@Controller('rewards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoleType.OPERATOR, UserRoleType.ADMIN)
export class RewardController {
  constructor(private readonly rewardService: RewardService) {}

  @Get()
  @ApiOperation({ summary: '리워드 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '리워드 목록 조회 성공',
    type: PaginateRewardsResponseDto,
  })
  @Serializer(PaginateRewardsResponseDto)
  async paginateRewards(
    @Actant() actant: AuthActant,
    @Query() paginateRewardsRequestDto: PaginateRewardsRequestDto,
  ): Promise<PaginateRewardsResponseDto> {
    return this.rewardService.paginateRewards({
      actant,
      paginateRewardsRequestDto,
    });
  }

  @Post()
  @ApiOperation({ summary: '리워드 생성' })
  @ApiResponse({
    status: 201,
    description: '리워드 생성 성공',
    type: CreateRewardResponseDto,
  })
  @Serializer(CreateRewardResponseDto)
  async createReward(
    @Actant() actant: AuthActant,
    @Body() createRewardRequestDto: CreateRewardRequestDto,
  ): Promise<CreateRewardResponseDto> {
    return this.rewardService.createReward({
      actant,
      createRewardRequestDto,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: '리워드 상세 조회' })
  @ApiResponse({
    status: 200,
    description: '리워드 상세 조회 성공',
    type: GetRewardByIdResponseDto,
  })
  @Serializer(GetRewardByIdResponseDto)
  async getRewardById(
    @Actant() actant: AuthActant,
    @Param('id') id: string,
  ): Promise<GetRewardByIdResponseDto> {
    return this.rewardService.getRewardById({ actant, id });
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
    @Actant() actant: AuthActant,
    @Param('id') id: string,
    @Body() updateRewardRequestDto: UpdateRewardRequestDto,
  ): Promise<UpdateRewardResponseDto> {
    return this.rewardService.updateReward({
      actant,
      id,
      updateRewardRequestDto,
    });
  }
}
