// microservice-exception.filter.ts
import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import { Logger } from '@nestjs/common';

@Catch()
export class MicroserviceExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(MicroserviceExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost): Observable<any> {
    const ctx = host.switchToRpc().getContext();
    const pattern = ctx.getPattern?.() || '알 수 없는 패턴';
    const serviceName = process.env.SERVICE_NAME || '알 수 없는 서비스';

    // 예외 유형에 따른 처리
    let error: any;
    if (exception instanceof RpcException) {
      const rpcError = exception.getError();
      console.log('>>> rpcError', rpcError);
      error = {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message:
          typeof rpcError === 'object' ? (rpcError as any).message : rpcError,
        code:
          typeof rpcError === 'object'
            ? (rpcError as any).code
            : 'INTERNAL_ERROR',
      };
    } else if (exception instanceof HttpException) {
      error = {
        status: exception.getStatus(),
        message: exception.message,
        code: 'HTTP_ERROR',
      };
    } else {
      error = {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: exception.message || '알 수 없는 오류가 발생했습니다',
        code: 'INTERNAL_ERROR',
      };
    }

    // 오류 정보 로깅
    this.logger.error({
      service: serviceName,
      pattern: pattern,
      error: {
        ...error,
        stack: exception.stack,
      },
      timestamp: new Date().toISOString(),
      metadata: ctx.getData?.() || {},
    });

    // RPC 예외로 변환하여 반환
    return throwError(() => ({
      status: error.status,
      message: error.message,
      code: error.code,
      service: serviceName,
      timestamp: new Date().toISOString(),
    }));
  }
}
