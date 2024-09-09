import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  /**
   * ID
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 생성일자
   */
  @CreateDateColumn({ select: false })
  createdAt: Date;

  /**
   * 수정일자
   */
  @UpdateDateColumn({ select: false })
  updatedAt: Date;
}
