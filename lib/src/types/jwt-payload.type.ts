import { Types } from 'mongoose';

export class JwtPayload {
  iss?: string; // 발급자 (issuer)
  sub: string | Types.ObjectId; // 사용자 ID
  email: string; // 사용자 이메일
  iat?: number; // 발급 시간 (issued at)
  exp?: number; // 만료 시간 (expiration time)
}
