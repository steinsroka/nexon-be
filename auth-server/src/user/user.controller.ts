import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Actant, AuthActant } from 'src/auth/decorators/actant.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Serializer } from 'src/auth/interceptors/serializer';
import { Roles } from 'src/user/decorators/roles.decorator';
import { RolesGuard } from 'src/user/guards/roles.guard';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserDto } from './dtos/user.dto';
import { UserRoleType } from './schemas/user.schema';
import { UserService } from './user.service';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleType.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '새 사용자 등록 (관리자/운영자 전용)' })
  @ApiResponse({
    status: 201,
    description: '사용자 등록 성공',
    type: UserDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (이메일 중복, 비밀번호 형식 오류 등)',
  })
  @ApiResponse({
    status: 403,
    description: '권한 부족',
  })
  @Serializer(UserDto)
  async createUserByAdmin(
    @Actant() actant: AuthActant,
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserDto> {
    return this.userService.createUserByAdmin(actant, createUserDto);
  }

  @Post('admin')
  @ApiOperation({ summary: '관리자 계정 생성 (초기 설정용)' })
  @ApiResponse({
    status: 201,
    description: '관리자 계정 생성 성공',
    type: UserDto,
  })
  @Serializer(UserDto)
  async createAdmin(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    return this.userService.createAdmin(createUserDto);
  }
}
