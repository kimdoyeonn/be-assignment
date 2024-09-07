import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/sign-up')
  @HttpCode(HttpStatus.NO_CONTENT)
  async signUp(@Body() createUserDto: CreateUserDto) {
    await this.usersService.createUser({
      username: createUserDto.username,
      password: createUserDto.password,
    });
  }
}
