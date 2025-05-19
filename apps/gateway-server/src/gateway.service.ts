import { MicroServiceType } from '@lib/enums/microservice.enum';
import {
  REFRESH_TOKEN_COOKIE_MAX_AGE,
  REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_PATH,
} from '@lib/constants/auth.constant';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Response } from 'express';
import { REQUEST } from '@nestjs/core';

// TODO: sendRequest를 추상화 하고 MSA별로 메서드 분리..?
@Injectable()
export class GatewayService {
  constructor(
    @Inject(MicroServiceType.AUTH_SERVER)
    private readonly authServiceClient: ClientProxy,
    @Inject(MicroServiceType.EVENT_SERVER)
    private readonly eventServiceClient: ClientProxy,
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
          throw new InternalServerErrorException(
            `Unknown service: ${service as string}`,
          );
      }
    })();

    try {
      return await firstValueFrom(
        client.send<RES>(pattern, {
          ...data,
          traceId: this.request['traceId'],
        }),
      );
    } catch (error) {
      if (error && typeof error === 'object') {
        error.service = service;
      }
      throw error;
    }
  }

  public setRefreshTokenCookie(res: Response, token: string): void {
    const isSecureCookie =
      this.configService.get<string>('NODE_ENV') === 'production';
    const domain = this.configService.get<string>('COOKIE_DOMAIN');

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isSecureCookie,
      sameSite: 'strict',
      maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE,
      path: REFRESH_TOKEN_COOKIE_PATH,
      ...(domain && { domain }),
    });
  }

  public clearRefreshTokenCookie(res: Response): void {
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
  }
}
