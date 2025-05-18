import { Actant, Roles } from '@lib/decorators';
import { GetRewardRequestByIdResponseDto } from '@lib/dtos/reward-request/get-reward-request-by-id.dto';
import {
  PaginateRewardRequestsRequestDto,
  PaginateRewardRequestsResponseDto,
} from '@lib/dtos/reward-request/paginate-reward-requests.dto';
import { UserRoleType } from '@lib/enums';
import { MicroServiceType } from '@lib/enums/microservice.enum';
import { JwtAuthGuard } from '@lib/guards';
import { RolesGuard } from '@lib/guards/roles.guard';
import { Serializer } from '@lib/interceptors';
import { AuthActant } from '@lib/types/actant.type';
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GatewayService } from '../gateway.service';

@ApiTags('reward-requests')
@Controller('reward-requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  UserRoleType.ADMIN,
  UserRoleType.AUDITOR,
  UserRoleType.OPERATOR,
  UserRoleType.USER,
)
export class RewardRequestController {
  constructor(private readonly gatewayService: GatewayService) {}

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
    return this.gatewayService.sendRequest<PaginateRewardRequestsResponseDto>(
      MicroServiceType.EVENT_SERVER,
      'reward_request_paginate_reward_requests',
      { actant, paginateRewardRequestsRequestDto },
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
    return this.gatewayService.sendRequest<GetRewardRequestByIdResponseDto>(
      MicroServiceType.EVENT_SERVER,
      'reward_request_get_reward_request_by_id',
      { actant, id },
    );
  }
}
