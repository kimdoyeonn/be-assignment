import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from '../auth/auth.service';
import { LocalAuthGuard } from '../auth/local-auth.guard';
import { User } from '../entity/user.entity';
import { Public } from '../decorator/is-public.decorator';
import { UserInfo } from '../auth/auth.types';

interface UserRequest extends Request {
  user: UserInfo;
}

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Public()
  @Post('/sign-up')
  @HttpCode(HttpStatus.NO_CONTENT)
  async signUp(@Body() createUserDto: CreateUserDto) {
    await this.usersService.createUser({
      username: createUserDto.username,
      password: createUserDto.password,
    });
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/sign-in')
  async signIn(
    @Request() req: UserRequest,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const result = await this.authService.signIn(req.user);
    return result;
  }

  @Post('/logout')
  async logout(@Body('userId') userId: User['id']) {
    await this.authService.removeRefreshToken(userId);
  }

  @Public()
  @Post('/refresh')
  async refresh(@Body('refreshToken') refreshToken: User['refreshToken']) {
    const tokens = await this.authService.refreshAccessToken(refreshToken);
    return tokens;
  }
}
