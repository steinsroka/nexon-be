import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

export abstract class BaseService {
  constructor(protected readonly client: ClientProxy) {}

  protected async sendRequest<T>(pattern: string, data: any): Promise<T> {
    try {
      return await firstValueFrom(this.client.send<T>(pattern, data));
    } catch (error) {
      console.error(`Error during ${pattern} request:`, error);
      throw error;
    }
  }
}
