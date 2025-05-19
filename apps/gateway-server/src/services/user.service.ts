import {
  CreateAdminRequestDto,
  CreateAdminResponseDto,
} from '@lib/dtos/user/create-admin.dto';
import {
  CreateUserRequestDto,
  CreateUserResponseDto,
} from '@lib/dtos/user/create-user.dto';
import {
  UpdateRoleRequestDto,
  UpdateRoleResponseDto,
} from '@lib/dtos/user/update-role.dto';
import { UserDto } from '@lib/dtos/user/user.dto';
import { MicroServiceType } from '@lib/enums/microservice.enum';
import { AuthActant } from '@lib/types/actant.type';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { REQUEST } from '@nestjs/core';
import { BaseGatewayService } from './base.service';
import {
  PaginateUsersRequestDto,
  PaginateUsersResponseDto,
} from '@lib/dtos/user/paginate-users.dto';

@Injectable()
export class UserService extends BaseGatewayService {
  constructor(
    @Inject(MicroServiceType.AUTH_SERVER)
    protected readonly authServiceClient: ClientProxy,
    @Inject(REQUEST) protected readonly request: Request,
  ) {
    super(authServiceClient, request);
  }

  async createAdmin(
    createAdminRequestDto: CreateAdminRequestDto,
  ): Promise<CreateAdminResponseDto> {
    return this.sendRequest<CreateAdminResponseDto>('user_create_admin', {
      createAdminRequestDto,
    });
  }

  async createUserByAdmin(
    actant: AuthActant,
    createUserRequestDto: CreateUserRequestDto,
  ): Promise<CreateUserResponseDto> {
    return this.sendRequest<CreateUserResponseDto>(
      'user_create_user_by_admin',
      { actant, createUserRequestDto },
    );
  }

  async paginateUsers(
    paginateUsersRequestDto: PaginateUsersRequestDto,
  ): Promise<PaginateUsersResponseDto> {
    return this.sendRequest<PaginateUsersResponseDto>('user_paginate_users', {
      paginateUsersRequestDto,
    });
  }

  async findOneById(id: string): Promise<UserDto> {
    return this.sendRequest<UserDto>('user_find_one_by_id', { id });
  }

  async updateUserRole(
    id: string,
    updateRoleRequestDto: UpdateRoleRequestDto,
    actant: AuthActant,
  ): Promise<UpdateRoleResponseDto> {
    return this.sendRequest<UpdateRoleResponseDto>('user_update_user_role', {
      actant,
      id,
      updateRoleRequestDto,
    });
  }

  protected getServiceType(): MicroServiceType {
    return MicroServiceType.AUTH_SERVER;
  }
}
