import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';

@Injectable()
export class TokenBlacklistService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private jwtService: JwtService,
  ) {}

  async addToBlacklist(token: string): Promise<boolean> {
    try {
      const payload = this.jwtService.verify(token);

      const expiration = payload.exp;
      const now = Math.floor(Date.now() / 1000);
      const ttlInSec = expiration - now;

      if (ttlInSec > 0) {
        await this.cacheManager.set(token, 'blacklisted', ttlInSec * 1000);
        return true;
      }
      return false; // NOTE: 이미 만료된 토큰
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // NOTE: 유효하지 않은 토큰이거나 다른 오류가 발생한 경우
      return false;
    }
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const blacklisted = await this.cacheManager.get(token);

    return blacklisted === 'blacklisted';
  }
}
