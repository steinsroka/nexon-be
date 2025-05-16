// 인증 관련 DTO
export class JwtPayloadDto {
  sub: string;
  username: string;
  iat?: number;
  exp?: number;
}
