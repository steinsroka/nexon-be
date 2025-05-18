import { LoginResponseDto } from '@lib/dtos/auth/login.dto';
import { LogoutResponseDto } from '@lib/dtos/auth/logout.dto';
import { RefreshResponseDto } from '@lib/dtos/auth/refresh.dto';
import { RegisterResponseDto } from '@lib/dtos/auth/register.dto';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth_register')
  async register(@Payload() data: any): Promise<RegisterResponseDto> {
    return this.authService.register(data);
  }

  @MessagePattern('auth_login')
  async login(@Payload() data: any): Promise<LoginResponseDto> {
    return this.authService.login(data);
  }

  @MessagePattern('auth_refresh')
  async refresh(@Payload() data: any): Promise<RefreshResponseDto> {
    return this.authService.refresh(data);
  }

  @MessagePattern('auth_logout')
  async logout(@Payload() data: any): Promise<LogoutResponseDto> {
    return this.authService.logout(data);
  }
}
