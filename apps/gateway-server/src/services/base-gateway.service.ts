import { MicroServiceType } from '@lib/enums/microservice.enum';
import { Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export abstract class BaseGatewayService {
  constructor(
    protected readonly client: ClientProxy,
    protected readonly request: Request,
  ) {}

  protected async sendRequest<RES, REQ = any>(
    pattern: string,
    data: REQ,
  ): Promise<RES> {
    try {
      return await firstValueFrom(
        this.client.send<RES>(pattern, {
          ...data,
          traceId: this.request['traceId'],
        }),
      );
    } catch (error) {
      if (error && typeof error === 'object') {
        error.service = this.getServiceType();
      }
      throw error;
    }
  }

  protected abstract getServiceType(): MicroServiceType;
}
