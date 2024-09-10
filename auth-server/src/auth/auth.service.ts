import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entity/user.entity';
import { JWT_REFRESH_EXPIRES_IN } from './auth.constants';
import { ConfigService } from '@nestjs/config';
import { PayloadUser, UserInfo } from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<UserInfo | null> {
    const user = await this.usersService.findOneByUsername(username);

    if (user === null) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      return {
        id: user.id,
        username,
      };
    }

    return null;
  }

  generateAccessToken(payload: PayloadUser) {
    return this.jwtService.sign(payload);
  }

  generateRefreshToken(payload: PayloadUser) {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: JWT_REFRESH_EXPIRES_IN,
    });
  }

  async generateTokens(payload: PayloadUser) {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    await this.usersService.updateRefreshToken(payload.sub, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  async signIn(user: UserInfo) {
    const payload = { sub: user.id, username: user.username };

    const { accessToken, refreshToken } = await this.generateTokens(payload);

    return { accessToken, refreshToken };
  }

  validateAccessToken(accessToken: string) {
    try {
      const payload = this.jwtService.verify(accessToken, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });

      return { isValid: true, payload };
    } catch (err) {
      console.log('JWT ERROR', err);

      // 토큰이 만료된 경우
      if (err && err.name === 'TokenExpiredError') {
        throw new UnauthorizedException(
          'Token has expired. Please login again.',
        );
      }

      // 토큰이 유효하지 않은 경우
      if (err && err.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token. Please login again.');
      }

      throw err;
    }
  }

  async validateRefreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersService.findOneById(payload.sub);
      const storedToken = user.refreshToken;

      if (!storedToken || storedToken !== refreshToken) {
        throw new BadRequestException('Invalid refresh token');
      }

      return payload;
    } catch (err) {
      console.log('JWT ERROR', err);

      // 토큰이 만료된 경우
      if (err && err.name === 'TokenExpiredError') {
        throw new UnauthorizedException(
          'Token has expired. Please login again.',
        );
      }

      // 토큰이 유효하지 않은 경우
      if (err && err.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token. Please login again.');
      }
    }
  }

  async refreshAccessToken(providedRefreshToken: string) {
    const payload = await this.validateRefreshToken(providedRefreshToken);

    const generatedAccessToken = this.generateAccessToken({
      sub: payload.sub,
      username: payload.username,
    });

    return {
      accessToken: generatedAccessToken,
    };
  }

  async removeRefreshToken(userId: User['id']) {
    await this.usersService.removeRefreshToken(userId);
  }
}
