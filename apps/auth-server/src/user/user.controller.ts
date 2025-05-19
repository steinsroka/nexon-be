import { Controller } from '@nestjs/common';
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
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './user.service';
import { AuthActant } from '@lib/types';
import {
  PaginateUsersRequestDto,
  PaginateUsersResponseDto,
} from '@lib/dtos/user/paginate-users.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern('user_create_admin')
  async createAdmin(
    @Payload() data: { createAdminRequestDto: CreateAdminRequestDto },
  ): Promise<CreateAdminResponseDto> {
    return this.userService.createAdmin(data);
  }

  @MessagePattern('user_create_user_by_admin')
  async createUserByAdmin(
    @Payload() data: { createUserRequestDto: CreateUserRequestDto },
  ): Promise<CreateUserResponseDto> {
    return this.userService.createUserByAdmin(data);
  }

  @MessagePattern('user_paginate_users')
  async paginateUsers(
    @Payload() data: { paginateUsersRequestDto: PaginateUsersRequestDto },
  ): Promise<PaginateUsersResponseDto> {
    return this.userService.paginateUsers(data);
  }

  @MessagePattern('user_find_one_by_id')
  async findOneById(@Payload() data: { id: string }): Promise<UserDto> {
    return this.userService.findOneById(data);
  }

  @MessagePattern('user_update_user_role')
  async updateUserRole(
    @Payload()
    data: {
      actant: AuthActant;
      id: string;
      updateRoleRequestDto: UpdateRoleRequestDto;
    },
  ): Promise<UpdateRoleResponseDto> {
    return this.userService.updateUserRole(data);
  }
}
