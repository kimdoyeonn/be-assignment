import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { AuthInfo, JwtUser } from './auth.types';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<TUser extends JwtUser>(
    err: Error,
    user: TUser,
    info: AuthInfo,
  ): TUser {
    if (err || !user) {
      // 토큰이 만료된 경우
      if (info && info.name === 'TokenExpiredError') {
        throw new UnauthorizedException(
          'Token has expired. Please login again.',
        );
      }

      // 토큰이 유효하지 않은 경우
      if (info && info.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token. Please login again.');
      }

      throw new UnauthorizedException('Authentication failed');
    }

    return user;
  }
}
