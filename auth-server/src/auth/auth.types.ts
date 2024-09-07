import { User } from '../entity/user.entity';

export type PayloadUser = {
  sub: User['id'];
  username: User['username'];
};

export type JwtUser = {
  userId: User['id'];
  username: User['username'];
};

export type UserInfo = {
  id: User['id'];
  username: User['username'];
};
