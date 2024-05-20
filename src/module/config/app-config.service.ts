import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Dialect } from 'sequelize';

@Injectable()
export class AppConfigService {

  constructor(private readonly configService: ConfigService) {}

  get port(): number {
    return this.configService.get<number>('app.port');
  }

  get siteName(): string {
    return this.configService.get<string>('app.siteName');
  }

  get client(): number {
    return this.configService.get<number>('client');
  }

  get salt(): number {
    return this.configService.get<number>('salt');
  }

  get sqlDialect(): Dialect { 
    return this.configService.get<string>('DB_DIALECT') as Dialect
  }

  get sqlHost(): string { 
    return this.configService.get<string>('DB_HOST')
  }

  get sqlPort(): number { 
    return this.configService.get<number>('DB_PORT')
  }
  get sqlUsername(): string { 
    return this.configService.get<string>('DB_USERNAME')
  }
  get sqlPassword(): string { 
    return this.configService.get<string>('DB_PASSWORD')
  }
  get sqlDatabase(): string { 
    return this.configService.get<string>('DB_DATABASE')
  }
}
