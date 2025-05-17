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
import { BaseService } from './base.service';

@Injectable()
export class UserService extends BaseService {
  constructor(
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
  ) {
    super(userServiceClient);
  }

  async createAdmin(
    createAdminRequestDto: CreateAdminRequestDto,
  ): Promise<CreateAdminResponseDto> {
    const resp = await this.sendRequest<CreateAdminResponseDto>(
      'user_create_admin',
      createAdminRequestDto,
    );

    return resp;
  }

  async createUserByAdmin(
    actant: AuthActant,
    createUserRequestDto: CreateUserRequestDto,
  ): Promise<CreateUserResponseDto> {
    const resp = await this.sendRequest<CreateUserResponseDto>(
      'user_create_user_by_admin',
      {
        actant,
        createUserRequestDto,
      },
    );

    return resp;
  }

  async findAll(): Promise<UserDto[]> {
    const resp = await this.sendRequest<UserDto[]>('user_find_all', {});

    return resp;
  }

  async findOne(id: string): Promise<UserDto> {
    const resp = await this.sendRequest<UserDto>('user_find_one_by_id', id);

    return resp;
  }

  async updateUserRole(
    actant: AuthActant,
    userId: string,
    updateRoleRequestDto: UpdateRoleRequestDto,
  ): Promise<UpdateRoleResponseDto> {
    const resp = await this.sendRequest<UpdateRoleResponseDto>(
      'user_update_user_role',
      {
        actant,
        userId,
        updateRoleRequestDto,
      },
    );

    return resp;
  }
}
