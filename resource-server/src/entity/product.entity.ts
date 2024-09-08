import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Invoice } from './invoice.entity';

export enum TransactionType {
  SALE = 'SALE',
  PURCHASE = 'PURCHASE',
}

@Entity()
export class Product extends BaseEntity {
  @Column('varchar')
  name: string;

  @Column('float')
  purity: number;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column('float')
  amount: number;

  @OneToMany(() => Invoice, (invoice) => invoice.product)
  invoices: Invoice[];
}
