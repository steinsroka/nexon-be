import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AuthActant } from '@lib/types/actant.type';
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
import { USER_SERVICE } from '../app.module';
import { BaseService } from './base.service';

@Injectable()
export class UserService extends BaseService {
  constructor(
    @Inject(USER_SERVICE) private readonly userServiceClient: ClientProxy,
  ) {
    super(userServiceClient);
  }

  async createAdmin(
    createAdminRequestDto: CreateAdminRequestDto,
  ): Promise<CreateAdminResponseDto> {
    return this.sendRequest<CreateAdminResponseDto>(
      'user_create_admin',
      createAdminRequestDto,
    );
  }

  async createUserByAdmin(
    actant: AuthActant,
    createUserRequestDto: CreateUserRequestDto,
  ): Promise<CreateUserResponseDto> {
    return this.sendRequest<CreateUserResponseDto>('user_create_by_admin', {
      actant,
      createUserRequestDto,
    });
  }

  async findAll(): Promise<UserDto[]> {
    return this.sendRequest<UserDto[]>('user_find_all', {});
  }

  async findOne(id: string): Promise<UserDto> {
    return this.sendRequest<UserDto>('user_find_one_by_id', id);
  }

  async updateUserRole(
    actant: AuthActant,
    userId: string,
    updateRoleRequestDto: UpdateRoleRequestDto,
  ): Promise<UpdateRoleResponseDto> {
    return this.sendRequest<UpdateRoleResponseDto>('user_update_role', {
      actant,
      userId,
      updateRoleRequestDto,
    });
  }
}
