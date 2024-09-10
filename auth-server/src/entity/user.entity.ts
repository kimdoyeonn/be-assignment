import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

export enum UserState {
  LIVE = 'LIVE',
  REMOVED = 'REMOVED',
}

@Entity()
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 128, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  refreshToken?: string;

  @Column({ type: 'enum', enum: UserState, default: UserState.LIVE })
  state: UserState;
}
