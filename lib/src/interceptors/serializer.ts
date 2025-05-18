import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { map, Observable } from 'rxjs';

// TODO: 공통 모듈로 분리
export interface ClassType<T = any> {
  new (...args: any[]): T;
}

export function Serializer<T>(classType: ClassType<T>) {
  return UseInterceptors(new SerializeInterceptor<T>(classType));
}

export class SerializeInterceptor<T> implements NestInterceptor {
  constructor(private readonly classType: ClassType<T>) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    return next.handle().pipe(
      map((data: any) => {
        return plainToInstance(this.classType, data, {
          excludeExtraneousValues: true,
          enableImplicitConversion: true,
        });
      }),
    );
  }
}
