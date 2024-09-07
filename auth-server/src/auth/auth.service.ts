import { BadRequestException, Injectable } from '@nestjs/common';
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
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (user && isPasswordValid) {
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

  async validateRefreshToken(refreshToken: string) {
    const payload = this.jwtService.verify(refreshToken, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });

    const user = await this.usersService.findOneById(payload.sub);
    const storedToken = user.refreshToken;

    if (!storedToken || storedToken !== refreshToken) {
      throw new BadRequestException('Invalid refresh token');
    }

    return user;
  }

  async refreshAccessToken(providedRefreshToken: string) {
    const user = await this.validateRefreshToken(providedRefreshToken);

    const payload = { sub: user.id, username: user.username };

    const generatedAccessToken = this.generateAccessToken(payload);

    return {
      accessToken: generatedAccessToken,
    };
  }

  async removeRefreshToken(userId: User['id']) {
    await this.usersService.removeRefreshToken(userId);
  }
}
