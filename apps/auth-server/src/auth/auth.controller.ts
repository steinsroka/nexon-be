import { LoginRequestDto, LoginResponseDto } from '@lib/dtos/auth/login.dto';
import {
  RegisterRequestDto,
  RegisterResponseDto,
} from '@lib/dtos/auth/register.dto';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { AuthActant } from '@lib/types/actant.type';
import {
  RefreshRequestDto,
  RefreshResponseDto,
} from '@lib/dtos/auth/refresh.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth_register')
  async register(
    @Payload() registerRequestDto: RegisterRequestDto,
  ): Promise<RegisterResponseDto> {
    return this.authService.register(registerRequestDto);
  }

  @MessagePattern('auth_login')
  async login(
    @Payload() loginRequestDto: LoginRequestDto,
  ): Promise<LoginResponseDto> {
    return this.authService.login(loginRequestDto);
  }

  @MessagePattern('auth_refresh')
  async refresh(
    @Payload() refreshRequestDto: RefreshRequestDto,
  ): Promise<RefreshResponseDto> {
    return this.authService.refresh(refreshRequestDto);
  }

  @MessagePattern('auth_logout')
  async logout(@Payload() actant: AuthActant): Promise<{ success: boolean }> {
    return this.authService.logout(actant);
  }
}
