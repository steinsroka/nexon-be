import { Controller } from '@nestjs/common';
import { CreateAdminResponseDto } from '@lib/dtos/user/create-admin.dto';
import { CreateUserResponseDto } from '@lib/dtos/user/create-user.dto';
import { UpdateRoleResponseDto } from '@lib/dtos/user/update-role.dto';
import { UserDto } from '@lib/dtos/user/user.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern('user_create_admin')
  async createAdmin(@Payload() data: any): Promise<CreateAdminResponseDto> {
    return this.userService.createAdmin(data);
  }

  @MessagePattern('user_create_user_by_admin')
  async createUserByAdmin(
    @Payload() data: any,
  ): Promise<CreateUserResponseDto> {
    return this.userService.createUserByAdmin(data);
  }

  @MessagePattern('user_find_all')
  async findAll(): Promise<UserDto[]> {
    return this.userService.findAll();
  }

  @MessagePattern('user_find_one_by_id')
  async findOneById(@Payload() data: any): Promise<UserDto> {
    return this.userService.findOneById(data);
  }

  @MessagePattern('user_update_user_role')
  async updateUserRole(@Payload() data: any): Promise<UpdateRoleResponseDto> {
    return this.userService.updateUserRole(data);
  }
}
