import { Body, Controller, Param } from '@nestjs/common';

import { Actant } from '@lib/decorators';
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
import { AuthActant } from '@lib/types/actant.type';
import { MessagePattern } from '@nestjs/microservices';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern('user_create_admin')
  async createAdmin(
    @Body() createAdminRequestDto: CreateAdminRequestDto,
  ): Promise<CreateAdminResponseDto> {
    return this.userService.createAdmin(createAdminRequestDto);
  }

  @MessagePattern('user_create_user_by_admin')
  async createUserByAdmin(
    @Actant() actant: AuthActant,
    @Body() createUserRequestDto: CreateUserRequestDto,
  ): Promise<CreateUserResponseDto> {
    return this.userService.createUserByAdmin(actant, createUserRequestDto);
  }

  @MessagePattern('user_find_all')
  async findAll(): Promise<UserDto[]> {
    return this.userService.findAll();
  }

  @MessagePattern('user_find_one_by_id')
  async findOneById(id: string): Promise<UserDto> {
    return this.userService.findOneById(id);
  }

  @MessagePattern('user_update_user_role')
  async updateUserRole(
    @Param('id') id: string,
    @Body() updateRoleRequestDto: UpdateRoleRequestDto,
    @Actant() actant: AuthActant,
  ): Promise<UpdateRoleResponseDto> {
    return this.userService.updateUserRole(actant, id, updateRoleRequestDto);
  }
}
