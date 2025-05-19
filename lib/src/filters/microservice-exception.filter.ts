import {
  ArgumentsHost,
  Catch,
  HttpStatus,
  Logger,
  RpcExceptionFilter,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

@Catch()
export class MicroserviceExceptionFilter
  implements RpcExceptionFilter<RpcException>
{
  private readonly logger = new Logger(MicroserviceExceptionFilter.name);

  catch(exception: RpcException, host: ArgumentsHost): Observable<any> {
    const rpc = host.switchToRpc();
    const ctx = rpc.getContext();

    const pattern = ctx.getPattern?.() || ctx?.args[1] || 'unkown pattern';
    const serviceName = process.env.SERVICE_NAME || 'unknown service';
    const metadata = ctx.getData?.() || (rpc as any).args[0] || {};
    const traceId = ctx?.traceId || metadata?.traceId || 'no-trace-id';

    let error = {};

    if (exception instanceof RpcException) {
      const rpcError = exception.getError();

      error = {
        status:
          typeof rpcError === 'object'
            ? (rpcError as any).status
            : HttpStatus.INTERNAL_SERVER_ERROR,
        code:
          typeof rpcError === 'object'
            ? (rpcError as any).code
            : 'INTERNAL_ERROR',
        message:
          typeof rpcError === 'object' ? (rpcError as any).message : rpcError,
      };
    } else {
      error = (exception as any).response;
    }

    const errObj = {
      traceId,
      service: serviceName,
      pattern: pattern,
      error,
      timestamp: new Date().toISOString(),
      metadata: ctx.getData?.() || (rpc as any).args[0] || {},
      stack: exception.stack,
    };

    this.logger.error(errObj);
    return throwError(() => errObj);
  }
}
