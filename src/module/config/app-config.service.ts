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
    return Number(this.configService.get<number>('SALT'));
  }

  get sqlDialect(): Dialect {
    return this.configService.get<string>('DB_DIALECT') as Dialect;
  }

  get sqlHost(): string {
    return this.configService.get<string>('DB_HOST');
  }

  get sqlPort(): number {
    return this.configService.get<number>('DB_PORT');
  }
  get sqlUsername(): string {
    return this.configService.get<string>('DB_USERNAME');
  }
  get sqlPassword(): string {
    return this.configService.get<string>('DB_PASSWORD');
  }
  get sqlDatabase(): string {
    return this.configService.get<string>('DB_DATABASE');
  }

  get jwtSecretKey(): string {
    return this.configService.get<string>('JWT_SECRET_KEY');
  }

  get jwtDuration(): string {
    return this.configService.get<string>('JWT_DURATION');
  }

  get googleMapsKey(): string {
    return this.configService.get<string>('GOOGLE_MAPS_KEY');
  }

  get googleProjectId(): string {
    return this.configService.get<string>('GOOGLE_PROJECT_ID');
  }

  get googleLocation(): string {
    return this.configService.get<string>('GOOGLE_LOCATION');
  }

  get googleEndpointId(): string {
    return this.configService.get<string>('GOOGLE_ENDPOINT_ID');
  }
}
