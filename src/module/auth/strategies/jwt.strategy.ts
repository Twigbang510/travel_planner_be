import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AppConfigService } from '../../config/app-config.service';
import { UserService } from '../../user/user.service';
import { TokenService } from '../../token/token.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly usersService: UserService,
    private readonly tokenService: TokenService,
    appConfigService: AppConfigService,
  ) {
    super({
      secretOrKey: appConfigService.jwtSecretKey,
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }
  async validate(payload: any) {
    const user = await this.usersService.findOneById(payload.id);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
