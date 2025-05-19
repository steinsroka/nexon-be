import { LoginRequestDto, LoginResponseDto } from '@lib/dtos/auth/login.dto';
import { LogoutResponseDto } from '@lib/dtos/auth/logout.dto';
import { RefreshResponseDto } from '@lib/dtos/auth/refresh.dto';
import {
  RegisterRequestDto,
  RegisterResponseDto,
} from '@lib/dtos/auth/register.dto';
import { AuthActant } from '@lib/types';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth_register')
  async register(
    @Payload() data: { registerRequestDto: RegisterRequestDto },
  ): Promise<RegisterResponseDto> {
    return this.authService.register(data);
  }

  @MessagePattern('auth_login')
  async login(
    @Payload() data: { loginRequestDto: LoginRequestDto },
  ): Promise<LoginResponseDto> {
    return this.authService.login(data);
  }

  @MessagePattern('auth_refresh')
  async refresh(
    @Payload() data: { refreshToken: string },
  ): Promise<RefreshResponseDto> {
    return this.authService.refresh(data);
  }

  @MessagePattern('auth_logout')
  async logout(@Payload() actant: AuthActant): Promise<LogoutResponseDto> {
    return this.authService.logout(actant);
  }
}
