import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from '../auth/auth.service';
import { LocalAuthGuard } from '../auth/local-auth.guard';
import { User } from '../entity/user.entity';
import { PayloadUser, UserInfo } from '../auth/auth.types';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GrpcMethod } from '@nestjs/microservices';

interface UserRequest extends Request {
  user: UserInfo;
}

@Controller('users')
@ApiTags('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @GrpcMethod('UsersService', 'validateToken')
  validateToken({ accessToken }: { accessToken: string }): {
    isValid: boolean;
    payload?: PayloadUser;
    message?: string;
  } {
    try {
      const { isValid, payload } =
        this.authService.validateAccessToken(accessToken);
      return { isValid, payload };
    } catch (e) {
      this.logger.error(e);
      return { isValid: false, message: e.message };
    }
  }

  /**
   * 회원가입
   * @param createUserDto 회원가입 정보
   */
  @ApiBadRequestResponse({
    description: 'username 또는 password가 유효하지 않은 경우',
    schema: {
      properties: {
        message: { example: 'Unauthorized' },
        statusCode: { example: 401 },
      },
    },
  })
  @ApiConflictResponse({
    description: '중복된 username인 경우',
    schema: {
      properties: {
        message: { example: 'Invalid username' },
        error: { example: 'Bad Request' },
        statusCode: { example: 400 },
      },
    },
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/sign-up')
  async signUp(@Body() createUserDto: CreateUserDto) {
    await this.usersService.createUser({
      username: createUserDto.username,
      password: createUserDto.password,
    });
  }

  /**
   * 로그인
   * @param req
   * @returns
   */
  @ApiUnauthorizedResponse({
    description: '로그인 정보가 유효하지 않은 경우',
    schema: {
      properties: {
        message: { example: 'Unauthorized' },
        statusCode: { example: 401 },
      },
    },
  })
  @ApiCreatedResponse({
    description: '로그인 성공',
    schema: {
      properties: {
        accessToken: {
          type: 'string',
          description: 'access token',
          example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMsInVzZXJuYW1lIjoidGVzdDEyMzIyMiIsImlhdCI6MTcyNTcxNTQzNywiZXhwIjoxNzI1NzE3MjM3fQ.E7l8l8-yNmM7MiVjWG7RCuDFOhuoq5uHrjGI8a38A5E',
        },
        refreshToken: {
          type: 'string',
          description: 'refresh token',
          example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMsInVzZXJuYW1lIjoidGVzdDEyMzIyMiIsImlhdCI6MTcyNTcxNTExNSwiZXhwIjoxNzI4MzA3MTE1fQ.GC_tEwjWTUc5JCVBUsSeoJxrzPMLwqKRwooXm8_OdD0',
        },
      },
    },
  })
  @UseGuards(LocalAuthGuard)
  @Post('/sign-in')
  async signIn(
    @Request() req: UserRequest,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const result = await this.authService.signIn(req.user);
    return result;
  }

  /**
   * 로그아웃
   * @param userId
   */
  @Post('/logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body('userId') userId: User['id']) {
    await this.authService.removeRefreshToken(userId);
  }

  /**
   *
   * @param refreshToken
   * @returns
   */
  @ApiCreatedResponse({
    description: '성공',
    schema: {
      properties: {
        accessToken: {
          type: 'string',
          description: 'access token',
          example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMsInVzZXJuYW1lIjoidGVzdDEyMzIyMiIsImlhdCI6MTcyNTcxNTQzNywiZXhwIjoxNzI1NzE3MjM3fQ.E7l8l8-yNmM7MiVjWG7RCuDFOhuoq5uHrjGI8a38A5E',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: '유효하지 않은 토큰',
    schema: {
      properties: {
        message: { example: 'Invalid token. Please login again.' },
        error: { example: 'Unauthorized' },
        statusCode: { example: 401 },
      },
    },
  })
  @Post('/refresh')
  async refresh(
    @Request() req,
    @Body('refreshToken') refreshToken: User['refreshToken'],
  ): Promise<{ accessToken: string }> {
    const tokens = await this.authService.refreshAccessToken(refreshToken);
    return tokens;
  }
}
