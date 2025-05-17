import { Injectable, Logger } from '@nestjs/common';

// @Injectable({ scope: Scope.TRANSIENT })
@Injectable()
export class LoggerService extends Logger {
  constructor(context: string) {
    super(context);
  }
}
