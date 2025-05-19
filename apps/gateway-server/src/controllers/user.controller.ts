import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../../../../lib/src/guards/roles.guard';
import { Actant, Roles } from '@lib/decorators';
import { AuthActant } from '@lib/types/actant.type';
import { UserRoleType } from '@lib/enums';
import { Serializer } from '@lib/interceptors';
import {
  CreateAdminRequestDto,
  CreateAdminResponseDto,
} from '@lib/dtos/user/create-admin.dto';
import {
  CreateUserRequestDto,
  CreateUserResponseDto,
} from '@lib/dtos/user/create-user.dto';
import {
  UpdateRoleRequestDto,
  UpdateRoleResponseDto,
} from '@lib/dtos/user/update-role.dto';
import { UserDto } from '@lib/dtos/user/user.dto';
import { UserService } from '../services/user.service';
import {
  PaginateUsersRequestDto,
  PaginateUsersResponseDto,
} from '@lib/dtos/user/paginate-users.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('admin')
  @ApiOperation({ summary: '관리자 계정 생성 (초기 설정용)' })
  @ApiResponse({
    status: 201,
    description: '관리자 계정 생성 성공',
    type: CreateAdminResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (이메일 중복, 비밀번호 형식 오류 등)',
  })
  @Serializer(CreateAdminResponseDto)
  async createAdmin(
    @Body() createAdminRequestDto: CreateAdminRequestDto,
  ): Promise<CreateAdminResponseDto> {
    return this.userService.createAdmin(createAdminRequestDto);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleType.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '새 사용자 등록 (관리자 전용)' })
  @ApiResponse({
    status: 201,
    description: '사용자 등록 성공',
    type: CreateUserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (이메일 중복, 비밀번호 형식 오류 등)',
  })
  @ApiResponse({
    status: 403,
    description: '권한 부족',
  })
  @Serializer(CreateUserResponseDto)
  async createUserByAdmin(
    @Actant() actant: AuthActant,
    @Body() createUserRequestDto: CreateUserRequestDto,
  ): Promise<CreateUserResponseDto> {
    return this.userService.createUserByAdmin(actant, createUserRequestDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleType.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '모든 사용자 조회 (관리자 전용)' })
  @ApiResponse({
    status: 200,
    description: '사용자 목록 조회 성공',
    type: [UserDto],
  })
  async paginateUsers(
    @Query() paginateUsersRequestDto: PaginateUsersRequestDto,
  ): Promise<PaginateUsersResponseDto> {
    return this.userService.paginateUsers(paginateUsersRequestDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleType.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '특정 사용자 조회 (관리자 전용)' })
  @ApiParam({ name: 'id', description: '사용자 ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: '사용자 조회 성공',
    type: UserDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (ID 형식 오류)',
  })
  @ApiResponse({
    status: 404,
    description: '사용자를 찾을 수 없음',
  })
  @Serializer(UserDto)
  async findOneById(@Param('id') id: string): Promise<UserDto> {
    return this.userService.findOneById(id);
  }

  @Patch(':id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleType.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '사용자 역할 변경 (관리자 전용)' })
  @ApiParam({ name: 'id', description: '사용자 ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: '사용자 역할 변경 성공',
    type: UpdateRoleResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (ID 형식 오류, 역할 유효성)',
  })
  @ApiResponse({
    status: 403,
    description: '권한 부족',
  })
  @ApiResponse({
    status: 404,
    description: '사용자를 찾을 수 없음',
  })
  @Serializer(UpdateRoleResponseDto)
  async updateUserRole(
    @Param('id') id: string,
    @Body() updateRoleRequestDto: UpdateRoleRequestDto,
    @Actant() actant: AuthActant,
  ): Promise<UpdateRoleResponseDto> {
    return this.userService.updateUserRole(id, updateRoleRequestDto, actant);
  }
}
