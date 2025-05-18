import { MicroServiceType } from '@lib/enums/microservice.enum';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Response } from 'express';
import { REQUEST } from '@nestjs/core';

// TODO: sendRequest를 추상화 하고 MSA별로 메서드 분리..?
@Injectable()
export class GatewayService {
  constructor(
    @Inject('AUTH_SERVER') private readonly authServiceClient: ClientProxy,
    @Inject('EVENT_SERVER') private readonly eventServiceClient: ClientProxy,
    @Inject(REQUEST) private request: Request,
    private readonly configService: ConfigService,
  ) {}

  async sendRequest<RES, REQ = any>(
    service: MicroServiceType,
    pattern: string,
    data: REQ,
  ): Promise<RES> {
    const client = (() => {
      switch (service) {
        case MicroServiceType.AUTH_SERVER:
          return this.authServiceClient;
        case MicroServiceType.EVENT_SERVER:
          return this.eventServiceClient;
        default:
          throw new Error(`Unknown service: ${service as string}`);
      }
    })();

    return await firstValueFrom(
      client.send<RES>(pattern, {
        ...data,
        traceId: this.request['traceId'],
      }),
    );
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
