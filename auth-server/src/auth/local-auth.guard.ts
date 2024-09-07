import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { User } from '../entity/user.entity';
import { UserInfo } from './auth.types';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(
    username: User['username'],
    password: User['password'],
  ): Promise<UserInfo> {
    const user = await this.authService.validateUser(username, password);

    if (user === null) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
