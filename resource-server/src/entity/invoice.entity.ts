import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Product, TransactionType } from './product.entity';

export enum InvoiceState {
  ORDER_COMPLETED = 'ORDER_COMPLETED',
  PAYMENT_COMPLETED = 'PAYMENT_COMPLETED',
  RECEIVED = 'RECEIVED',
}

@Entity()
export class Invoice extends BaseEntity {
  @Column()
  orderId: string;

  @Column()
  userId: number;

  @Column({
    type: 'enum',
    enum: InvoiceState,
  })
  state: InvoiceState;

  @Column()
  productId: number;

  @ManyToOne(() => Product, (product) => product.invoices)
  product: Product;

  @Column('float')
  amount: number;

  @Column('int')
  price: number;

  @Column()
  zipcode: string;

  @Column()
  shippingAddress: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;
}
