import {
  CreateUserActivityRequestDto,
  CreateUserActivityResponseDto,
} from '@lib/dtos/user-activity/create-user-activity.dto';
import { MicroServiceType } from '@lib/enums/microservice.enum';
import { AuthActant } from '@lib/types/actant.type';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { REQUEST } from '@nestjs/core';
import { BaseGatewayService } from './base.service';

@Injectable()
export class UserActivityService extends BaseGatewayService {
  constructor(
    @Inject(MicroServiceType.AUTH_SERVER)
    protected readonly authServiceClient: ClientProxy,
    @Inject(REQUEST) protected readonly request: Request,
  ) {
    super(authServiceClient, request);
  }

  async createUserActivity(
    actant: AuthActant,
    userId: string,
    createUserActivityRequestDto: CreateUserActivityRequestDto,
  ): Promise<CreateUserActivityResponseDto> {
    return this.sendRequest<CreateUserActivityResponseDto>(
      'user_activity_create_user_activity',
      { actant, userId, createUserActivityRequestDto },
    );
  }

  protected getServiceType(): MicroServiceType {
    return MicroServiceType.AUTH_SERVER;
  }
}
