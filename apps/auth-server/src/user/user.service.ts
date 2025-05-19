import { CreateAdminRequestDto } from '@lib/dtos/user/create-admin.dto';
import { CreateUserRequestDto } from '@lib/dtos/user/create-user.dto';
import { UpdateRoleRequestDto } from '@lib/dtos/user/update-role.dto';
import { UserDto } from '@lib/dtos/user/user.dto';
import { UserRoleType } from '@lib/enums';
import { AuthActant } from '@lib/types/actant.type';
import { RpcExceptionUtil } from '@lib/utils/rpc-exception.util';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import {
  PaginateUsersRequestDto,
  PaginateUsersResponseDto,
} from '@lib/dtos/user/paginate-users.dto';
import { PAGINATION_DEFAULT_PAGE, PAGINATION_MIN_RPP } from '@lib/constants';
import { PaginationResponseDto } from '@lib/dtos/common/pagination.dto';
import { RegisterRequestDto } from '@lib/dtos/auth/register.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  private readonly SALT_ROUNDS = 10;

  async createAdmin(req: {
    createAdminRequestDto: CreateAdminRequestDto;
  }): Promise<UserDto> {
    const { email, password, name } = req.createAdminRequestDto;

    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

    try {
      const savedUser = await this.userModel.create({
        name,
        email,
        password: hashedPassword,
        role: UserRoleType.ADMIN,
      });

      return plainToInstance(UserDto, savedUser, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      // NOTE: email 필드에 대해 MongoDB 중복 키 에러 처리 (E11000)
      if (error.code === 11000 && error.keyPattern?.email) {
        throw RpcExceptionUtil.badRequest(
          '이미 등록된 이메일입니다',
          'EMAIL_ALREADY_EXISTS',
        );
      }
      throw error;
    }
  }

  async createUserByAdmin(req: {
    createUserRequestDto: CreateUserRequestDto;
  }): Promise<UserDto> {
    const { email, password, name, role } = req.createUserRequestDto;

    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

    try {
      const savedUser = await this.userModel.create({
        name,
        email,
        password: hashedPassword,
        role,
      });

      return plainToInstance(UserDto, savedUser);
    } catch (error) {
      if (error.code === 11000 && error.keyPattern?.email) {
        throw RpcExceptionUtil.badRequest(
          '이미 등록된 이메일입니다',
          'EMAIL_ALREADY_EXISTS',
        );
      }
      throw error;
    }
  }

  async paginateUsers(req: {
    paginateUsersRequestDto: PaginateUsersRequestDto;
  }): Promise<PaginateUsersResponseDto> {
    const { page = PAGINATION_DEFAULT_PAGE, rpp = PAGINATION_MIN_RPP } =
      req.paginateUsersRequestDto;

    const skip = (page - 1) * rpp;
    const events = await this.userModel
      .find()
      .sort({ id: -1 })
      .skip(skip)
      .limit(rpp)
      .exec();

    const total = await this.userModel.countDocuments().exec();
    const items = events.map((user) => {
      return plainToInstance(UserDto, user, {
        enableCircularCheck: true,
        excludeExtraneousValues: true,
      });
    });

    return PaginationResponseDto.create(items, total, page, rpp);
  }

  async findOneById(req: { id: string | Types.ObjectId }): Promise<UserDto> {
    const { id } = req;

    if (!Types.ObjectId.isValid(id)) {
      throw RpcExceptionUtil.badRequest(
        '유효하지 않은 ID 형식입니다',
        'INVALID_ID_FORMAT',
      );
    }

    const user = await this.userModel.findById(id);

    if (!user) {
      throw RpcExceptionUtil.notFound(
        '사용자를 찾을 수 없습니다',
        'USER_NOT_FOUND',
      );
    }

    return plainToInstance(UserDto, user, {
      excludeExtraneousValues: true,
    });
  }

  async updateUserRole(req: {
    actant: AuthActant;
    id: string;
    updateRoleRequestDto: UpdateRoleRequestDto;
  }): Promise<UserDto> {
    const { user: requestingUser } = req.actant;
    const { role: newRole } = req.updateRoleRequestDto;
    const { id } = req;

    if (requestingUser.role !== UserRoleType.ADMIN) {
      throw RpcExceptionUtil.forbidden(
        '사용자 역할을 변경할 권한이 없습니다',
        'INSUFFICIENT_PERMISSIONS',
      );
    }

    if (!Types.ObjectId.isValid(id)) {
      throw RpcExceptionUtil.badRequest(
        '유효하지 않은 ID 형식입니다',
        'INVALID_ID_FORMAT',
      );
    }

    if (!Object.values(UserRoleType).includes(newRole)) {
      throw RpcExceptionUtil.badRequest(
        '유효하지 않은 역할입니다',
        'INVALID_ROLE',
      );
    }

    const user = await this.userModel.findById(id);

    if (!user) {
      throw RpcExceptionUtil.notFound(
        '사용자를 찾을 수 없습니다',
        'USER_NOT_FOUND',
      );
    }

    // NOTE: 관리자의 역할을 변경하는 것 방지
    if (id === requestingUser.id || user.role === UserRoleType.ADMIN) {
      throw RpcExceptionUtil.forbidden(
        '관리자 권한은 변경할 수 없습니다',
        'ADMIN_ROLE_PROTECTED',
      );
    }

    user.role = newRole;
    const updatedUser = await user.save();

    return plainToInstance(UserDto, updatedUser);
  }

  /**
   * auth 관련 메서드
   */
  async createUser(req: {
    registerRequestDto: RegisterRequestDto;
  }): Promise<UserDto> {
    const { email, password, checkPassword, name } = req.registerRequestDto;

    if (password !== checkPassword) {
      throw RpcExceptionUtil.badRequest(
        '비밀번호가 일치하지 않습니다',
        'PASSWORD_MISMATCH',
      );
    }

    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

    try {
      const newUser = await this.userModel.create({
        name: name,
        email: email,
        password: hashedPassword,
        role: UserRoleType.USER,
      });

      return plainToInstance(UserDto, newUser);
    } catch (error) {
      if (error.code === 11000 && error.keyPattern?.email) {
        throw RpcExceptionUtil.badRequest(
          '이미 등록된 이메일입니다',
          'EMAIL_ALREADY_EXISTS',
        );
      }
      throw error;
    }
  }

  async findOneByEmail(email: string): Promise<UserDto> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw RpcExceptionUtil.notFound(
        '사용자를 찾을 수 없습니다',
        'USER_NOT_FOUND',
      );
    }

    return plainToInstance(UserDto, user);
  }

  async validateUser(email: string, password: string): Promise<UserDto> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw RpcExceptionUtil.notFound(
        '사용자를 찾을 수 없습니다',
        'USER_NOT_FOUND',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw RpcExceptionUtil.badRequest(
        '비밀번호가 일치하지 않습니다',
        'INVALID_CREDENTIALS',
      );
    }

    return plainToInstance(UserDto, user);
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    if (!Types.ObjectId.isValid(userId)) {
      throw RpcExceptionUtil.badRequest(
        '유효하지 않은 ID 형식입니다',
        'INVALID_ID_FORMAT',
      );
    }

    const hashedRefreshToken = await bcrypt.hash(
      refreshToken,
      this.SALT_ROUNDS,
    );

    await this.userModel.findByIdAndUpdate(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async removeRefreshToken(userId: string): Promise<void> {
    if (!Types.ObjectId.isValid(userId)) {
      throw RpcExceptionUtil.badRequest(
        '유효하지 않은 ID 형식입니다',
        'INVALID_ID_FORMAT',
      );
    }

    await this.userModel.findByIdAndUpdate(userId, {
      refreshToken: null,
    });
  }
}
