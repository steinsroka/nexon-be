import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class RpcExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(RpcExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const traceId = request['traceId'] || 'no-trace-id';

    const status = this.extractStatusCode(exception);
    const code = this.extractErrorCode(exception);
    const message = this.extractErrorMessage(exception);
    const service = this.extractServiceName(exception);

    const errorResponse = {
      statusCode: status,
      message: message,
      code: code,
      traceId: traceId,
      service: service,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    this.logger.error(`
      Status: ${status}
      Error: ${message}
      Code: ${code}
      TraceId: ${traceId}
      Service: ${service}
      Path: ${request.url}
      ${exception.stack || ''}
    `);

    response.status(status).json(errorResponse);
  }

  private extractStatusCode(exception: any): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    if (exception?.error?.status) {
      return exception.error.status;
    }

    if (exception?.status) {
      return exception.status;
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private extractErrorCode(exception: any): string {
    if (exception?.error?.code) {
      return exception.error.code;
    }

    if (exception?.code) {
      return exception.code;
    }

    return 'INTERNAL_ERROR';
  }

  private extractErrorMessage(exception: any): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      if (typeof response === 'object' && response['message']) {
        return response['message'];
      }
      return response as string;
    }

    if (exception?.error?.message) {
      return exception.error.message;
    }

    if (exception?.message) {
      return exception.message;
    }

    return 'Internal server error';
  }

  private extractServiceName(exception: any): string {
    if (exception?.error?.service) {
      return exception.error.service;
    }

    if (exception?.service) {
      return exception.service;
    }

    return 'unknown';
  }
}
