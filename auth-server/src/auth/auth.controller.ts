import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterRequestDto, RegisterResponseDto } from './dtos/register.dto';
import { Serializer } from './interceptors/serializer';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: '사용자 회원가입' })
  @ApiResponse({
    status: 201,
    description: '회원가입 성공',
    type: RegisterResponseDto,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 (이메일 중복 등)' })
  @Serializer(RegisterResponseDto)
  async register(
    @Body() registerRequestDto: RegisterRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RegisterResponseDto> {
    return this.authService.register(registerRequestDto, res);
  }
}
