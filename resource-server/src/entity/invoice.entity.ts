import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Product, TransactionType } from './product.entity';

export enum InvoiceState {
  DRAFT = 'DRAFT',
  DELETED = 'DELETED',
  ORDER_COMPLETED = 'ORDER_COMPLETED',
  PAYMENT_COMPLETED = 'PAYMENT_COMPLETED',
  FULFILLMENT_COMPLETED = 'FULFILLMENT_COMPLETED',
}

@Entity()
export class Invoice extends BaseEntity {
  @Column({ unique: true })
  orderNumber: string;

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

  @Column({ nullable: true })
  zipcode?: string;

  @Column({ nullable: true })
  shippingAddress?: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;
}
