import { MicroServiceType } from '@lib/enums/microservice.enum';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Response } from 'express';

@Injectable()
export class GatewayService {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authServiceClient: ClientProxy,
    @Inject('EVENT_SERVICE') private readonly eventServiceClient: ClientProxy,
    private readonly configService: ConfigService,
  ) {}

  async sendRequest<RES, REQ = any>(
    service: MicroServiceType,
    pattern: string,
    data: REQ,
  ): Promise<RES> {
    try {
      const client = (() => {
        switch (service) {
          case MicroServiceType.AUTH_SERVICE:
            return this.authServiceClient;
          case MicroServiceType.EVENT_SERVICE:
            return this.eventServiceClient;
          default:
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            throw new Error(`Unknown service: ${service}`);
        }
      })();

      return await firstValueFrom(client.send<RES>(pattern, data));
    } catch (error) {
      console.error(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `[GatewayService.sendRequest] service: ${service} pattern: ${pattern} data: ${data}}`,
        error,
      );
      throw error;
    }
  }

  public setRefreshTokenCookie(res: Response, token: string): void {
    const isSecureCookie =
      this.configService.get<string>('NODE_ENV') === 'production';
    const domain = this.configService.get<string>('COOKIE_DOMAIN');

    res.cookie('refresh_token', token, {
      httpOnly: true,
      secure: isSecureCookie,
      sameSite: 'strict',
      maxAge: 1 * 24 * 60 * 60 * 1000, // 1일 (밀리초)
      path: '/auth/refresh',
      ...(domain && { domain }),
    });
  }

  public clearRefreshTokenCookie(res: Response): void {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
  }
}
