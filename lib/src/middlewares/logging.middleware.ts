import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private logger = new Logger('HttpRequest');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';

    const traceId = (req.headers['x-trace-id'] as string) || uuidv4();

    req['traceId'] = traceId;
    res.setHeader('x-trace-id', traceId);

    const start = Date.now();

    this.logger.verbose(
      `${traceId} ${method} ${originalUrl} \n ${userAgent} ${ip}`,
    );

    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      const duration = Date.now() - start;
      const traceId = res.getHeader('x-trace-id') || 'no-trace-id';

      if (statusCode >= 500) {
        this.logger.error(
          `${traceId.toString()} ${method} ${originalUrl} ${statusCode} ${contentLength} - ${duration}ms`,
        );
      } else if (statusCode >= 400) {
        this.logger.warn(
          `${traceId.toString()} ${method} ${originalUrl} ${statusCode} ${contentLength} - ${duration}ms`,
        );
      } else {
        this.logger.verbose(
          `${traceId.toString()} ${method} ${originalUrl} ${statusCode} ${contentLength} - ${duration}ms`,
        );
      }
    });

    next();
  }
}
