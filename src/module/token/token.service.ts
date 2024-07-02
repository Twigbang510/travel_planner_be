import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '../config/app-config.service';
import { JwtPayload } from './types/token-payload.type';

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private configService: AppConfigService,
  ) {}
  async signJWTToken({ id, duration }: JwtPayload): Promise<string> {
    const token = this.jwtService.sign(
      {
        id,
        expiresIn: duration,
      },
      {
        secret: this.configService.jwtSecretKey,
      },
    );
    return token;
  }

  async getToken(id: string): Promise<string> {
    const accessToken = await this.signJWTToken({
      id: id,
      duration: this.configService.jwtDuration,
    });
    return accessToken;
  }
}
