import { Actant, Roles } from '@lib/decorators';
import { GetRewardRequestByIdResponseDto } from '@lib/dtos/reward-request/get-reward-request-by-id.dto';
import {
  PaginateRewardRequestsRequestDto,
  PaginateRewardRequestsResponseDto,
} from '@lib/dtos/reward-request/paginate-reward-requests.dto';
import { UserRoleType } from '@lib/enums';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../../../../lib/src/guards/roles.guard';
import { Serializer } from '@lib/interceptors';
import { AuthActant } from '@lib/types/actant.type';
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RewardRequestService } from '../services/reward-request.service';

@ApiTags('reward-requests')
@Controller('reward-requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoleType.ADMIN, UserRoleType.AUDITOR, UserRoleType.USER)
export class RewardRequestController {
  constructor(private readonly rewardRequestService: RewardRequestService) {}

  @Get()
  @ApiOperation({ summary: '리워드 요청 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '리워드 요청 목록 조회 성공',
    type: PaginateRewardRequestsResponseDto,
  })
  // @Serializer(PaginateRewardRequestsResponseDto)
  async paginateRewardRequests(
    @Actant() actant: AuthActant,
    @Query() paginateRewardRequestsRequestDto: PaginateRewardRequestsRequestDto,
  ): Promise<PaginateRewardRequestsResponseDto> {
    return this.rewardRequestService.paginateRewardRequests(
      actant,
      paginateRewardRequestsRequestDto,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: '리워드 요청 상세 조회' })
  @ApiResponse({
    status: 200,
    description: '리워드 요청 상세 조회 성공',
    type: GetRewardRequestByIdResponseDto,
  })
  @Serializer(GetRewardRequestByIdResponseDto)
  async getRewardRequestById(
    @Actant() actant: AuthActant,
    @Param('id') id: string,
  ): Promise<GetRewardRequestByIdResponseDto> {
    return this.rewardRequestService.getRewardRequestById(actant, id);
  }
}
