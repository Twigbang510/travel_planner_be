import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const UserData = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.password) {
      const { password, ...safeUser } = user;
      return data ? safeUser[data] : safeUser;
    }

    return data ? user?.[data] : user;
  },
);
