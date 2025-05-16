import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { Actant, AuthActant } from './decorators/actant.decorator';
import { Cookies } from './decorators/cookie.decorator';
import { LoginRequestDto, LoginResponseDto } from './dtos/login.dto';
import { RegisterRequestDto, RegisterResponseDto } from './dtos/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { MessagePattern } from '@nestjs/microservices';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @Post('register')
  // @ApiOperation({ summary: '사용자 회원가입' })
  // @ApiResponse({
  //   status: 201,
  //   description: '회원가입 성공',
  //   type: RegisterResponseDto,
  // })
  // @ApiResponse({ status: 400, description: '잘못된 요청 (이메일 중복 등)' })
  // @Serializer(RegisterResponseDto)
  @MessagePattern('user_search_by_credentials')
  async register(
    registerRequestDto: RegisterRequestDto,
  ): Promise<RegisterResponseDto> {
    console.log('register', registerRequestDto);
    return this.authService.register(registerRequestDto);
  }

  @Post('login')
  @ApiOperation({ summary: '사용자 로그인' })
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  // @Serializer(LoginResponseDto)
  async login(
    @Body() loginRequestDto: LoginRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    return this.authService.login(loginRequestDto, res);
  }

  @Post('refresh')
  @ApiOperation({ summary: '토큰 갱신' })
  @ApiCookieAuth('refresh_token')
  @ApiResponse({
    status: 200,
    description: '토큰 갱신 성공',
  })
  @ApiResponse({ status: 401, description: '유효하지 않은 리프레시 토큰' })
  async refresh(
    @Cookies('refresh_token') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    return this.authService.refresh(refreshToken, res);
  }

  @Post('logout')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({
    status: 200,
    description: '로그아웃 성공',
  })
  async logout(
    @Actant() actant: AuthActant,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ success: boolean }> {
    return this.authService.logout(actant, res);
  }
}
