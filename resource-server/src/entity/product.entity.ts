import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Invoice } from './invoice.entity';

export enum TransactionType {
  SALE = 'SALE',
  PURCHASE = 'PURCHASE',
}

@Entity()
export class Product extends BaseEntity {
  /**
   * 상품명
   */
  @Column({ type: 'varchar', length: 30 })
  name: string;

  /**
   * 순도
   */
  @Column('float')
  purity: number;

  /**
   * 거래 유형
   */
  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  /**
   * 재고 수량
   */
  @Column({ type: 'float', select: false })
  amount: number;

  /**
   * 가격
   */
  @Column('int')
  price: number;

  @OneToMany(() => Invoice, (invoice) => invoice.product)
  invoices: Invoice[];
}
