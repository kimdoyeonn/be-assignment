import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 유저를 조회합니다.
   * @param username 계정명
   * @returns 유저 데이터 | null
   */
  async findOne(username: string): Promise<User | null> {
    const result = await this.userRepository.findOneBy({ username });
    return result;
  }

  /**
   * 유저를 조회하거나 예외를 발생시킵니다.
   * @param username 계정명
   * @returns 유저 데이터
   */
  async findOneOrFail(username: string): Promise<User | null> {
    const result = await this.userRepository.findOneBy({ username });

    if (result !== null) {
      throw new ConflictException('Username already exists');
    }

    return result;
  }

  async createUser(createUserDto: CreateUserDto) {
    const { username, password } = createUserDto;

    await this.validateUsername(username);
    await this.validatePassword(password);

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await this.userRepository.insert({
      username,
      password: hashedPassword,
    });

    return result;
  }

  /**
   * username에 대한 유효성 검사
   * - username이 조건에 맞는지 확인.
   * - 존재하는 username인지 확인.
   * @param username 계정명
   */
  async validateUsername(username: User['username']) {
    if (!username) {
      throw new BadRequestException('Username is required');
    }

    const usernameRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{10,}$/;

    const isValidUsername = usernameRegex.test(username);
    if (!isValidUsername) {
      throw new BadRequestException('Invalid username');
    }

    await this.findOneOrFail(username);
  }

  /**
   * password에 대한 유효성 검사
   * - 제약조건을 만족하는지 확인합니다.
   *  - 비밀번호는 10자 이상이어야 합니다.
   *  - 비밀번호는 숫자만으로 이루어질 수 없습니다.
   *  - 비밀번호는 [숫자, 문자, 특수문자] 중 2가지 이상을 포함해야 합니다.
   * @param password 비밀번호
   */
  private async validatePassword(password: string) {
    if (!password) {
      throw new BadRequestException('Password is required');
    }

    /**
     * 문자를 최소 하나 포함하고, [숫자, 특수문자] 중 최소 하나를 포함, 10자 이상
     * -> 숫자만으로 이루어지지 않음 + 숫자, 문자, 특수문자 중 2가지를 포함함 + 10자 이상
     */
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d|.*[^A-Za-z0-9]).{10,}$/;
    const isValidPassword = passwordRegex.test(password);
    if (!isValidPassword) {
      throw new BadRequestException('Invalid Password');
    }
  }
}
