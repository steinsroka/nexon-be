import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { Model, Types } from 'mongoose';

import { RegisterRequestDto } from '../auth/dtos/register.dto';
import { CreateAdminRequestDto } from './dtos/create-admin.dto';
import { CreateUserRequestDto } from './dtos/create-user.dto';
import { UpdateRoleRequestDto } from './dtos/update-role.dto';
import { UserDto } from './dtos/user.dto';
import { User, UserDocument, UserRoleType } from './schemas/user.schema';
import { AuthActant } from '../auth/decorators/actant.decorator';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  private readonly SALT_ROUNDS = 10;

  async createAdmin(
    createAdminRequestDto: CreateAdminRequestDto,
  ): Promise<UserDto> {
    const { email, password, name } = createAdminRequestDto;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('이미 등록된 이메일입니다');
    }

    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

    const newUser = new this.userModel({
      name,
      email,
      password: hashedPassword,
      role: UserRoleType.ADMIN,
    });

    const savedUser = await newUser.save();
    return plainToInstance(UserDto, savedUser, {
      excludeExtraneousValues: true,
    });
  }

  async createUserByAdmin(
    actant: AuthActant,
    createUserRequestDto: CreateUserRequestDto,
  ): Promise<UserDto> {
    const { email, password, name, role } = createUserRequestDto;
    const { user } = actant;

    if (UserRoleType.ADMIN !== user.role) {
      throw new ForbiddenException('사용자를 등록할 권한이 없습니다');
    }

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('이미 등록된 이메일입니다');
    }

    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

    const newUser = new this.userModel({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const savedUser = await newUser.save();
    return plainToInstance(UserDto, savedUser);
  }

  // TODO: Pagination 추가
  async findAll(): Promise<UserDto[]> {
    const users = await this.userModel.find().exec();
    return users.map((user) =>
      plainToInstance(UserDto, user, { excludeExtraneousValues: true }),
    );
  }

  async findOneById(id: string | Types.ObjectId): Promise<UserDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('유효하지 않은 ID 형식입니다');
    }

    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다');
    }

    return plainToInstance(UserDto, user);
  }

  async updateUserRole(
    actant: AuthActant,
    userId: string,
    updateRoleRequestDto: UpdateRoleRequestDto,
  ): Promise<UserDto> {
    const { user: requestingUser } = actant;
    const { role: newRole } = updateRoleRequestDto;

    if (requestingUser.role !== UserRoleType.ADMIN) {
      throw new ForbiddenException('사용자 역할을 변경할 권한이 없습니다');
    }

    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('유효하지 않은 ID 형식입니다');
    }

    if (!Object.values(UserRoleType).includes(newRole)) {
      throw new BadRequestException('유효하지 않은 역할입니다');
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다');
    }

    // NOTE: 관리자의 역할을 변경하는 것 방지
    if (userId === requestingUser.id || user.role === UserRoleType.ADMIN) {
      throw new ForbiddenException('관리자 권한은 변경할 수 없습니다');
    }

    user.role = newRole;
    const updatedUser = await user.save();

    return plainToInstance(UserDto, updatedUser);
  }

  /**
   * auth 관련 메서드
   */
  async createUser(registerDto: RegisterRequestDto): Promise<User> {
    const { email, password, checkPassword, name } = registerDto;

    if (password !== checkPassword) {
      throw new BadRequestException('비밀번호가 일치하지 않습니다');
    }

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('이미 등록된 이메일입니다');
    }

    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

    const newUser = new this.userModel({
      name,
      email,
      password: hashedPassword,
      role: UserRoleType.USER,
    });

    return newUser.save();
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('비밀번호가 일치하지 않습니다');
    }

    return user;
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('유효하지 않은 ID 형식입니다');
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
      throw new BadRequestException('유효하지 않은 ID 형식입니다');
    }

    await this.userModel.findByIdAndUpdate(userId, {
      refreshToken: null,
    });
  }
}
