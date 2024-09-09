import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AuthService } from 'src/auth/auth.service';

export const AuthenticatedUser = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const authorization = request.headers['authorization'];

    if (!authorization) {
      throw new UnauthorizedException('Authorization header not found');
    }

    const token = authorization.split(' ')[1];

    const authService = request.authService as AuthService;

    try {
      const response = await firstValueFrom(authService.validateToken(token));

      if (!response.isValid) {
        throw new UnauthorizedException('Invalid token');
      }

      const payload = {
        userId: response.payload.sub,
        username: response.payload.username,
      };
      request.user = payload; // 유효한 토큰인 경우 payload를 request.user에 저장

      return payload; // 페이로드 반환
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  },
);
