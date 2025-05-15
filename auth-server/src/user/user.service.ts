import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, UserRoleType } from './schemas/user.schema';
import { RegisterRequestDto } from '../auth/dtos/register.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(registerDto: RegisterRequestDto): Promise<User> {
    const { email, password, checkPassword, name } = registerDto;

    if (password !== checkPassword) {
      throw new BadRequestException('비밀번호가 일치하지 않습니다');
    }

    const existingUser = await this.userModel.findOne({
      $or: [{ email }],
    });

    if (existingUser) {
      throw new BadRequestException('이미 등록된 이메일입니다');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new this.userModel({
      name,
      email,
      password: hashedPassword,
      role: UserRoleType.USER,
    });

    return newUser.save();
  }

  async findOneById(id: string | Types.ObjectId): Promise<User> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('유효하지 않은 ID 형식입니다');
    }

    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다');
    }

    return user;
  }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다');
    }

    return user;
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

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
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
