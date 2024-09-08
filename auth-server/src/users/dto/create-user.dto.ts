import { IsString } from 'class-validator';

export class CreateUserDto {
  /**
   * 계정명
   * 10자 이상이고 최소 하나의 숫자와 영문자를 포함해야 합니다.
   * @example adminTest1234
   */
  @IsString()
  username: string;

  /**
   * 비밀번호
   * 10자 이상이고 영문자, 숫자, 특수문자 중 최소 2가지를 포함해야 합니다.
   * @example testtest1234!
   */
  @IsString()
  password: string;
}
