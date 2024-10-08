import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Product, TransactionType } from './product.entity';

export enum InvoiceState {
  DRAFT = 'DRAFT',
  CANCELED = 'CANCELED',
  ORDER_COMPLETED = 'ORDER_COMPLETED',
  PAYMENT_COMPLETED = 'PAYMENT_COMPLETED',
  FULFILLMENT_COMPLETED = 'FULFILLMENT_COMPLETED',
}

@Entity()
export class Invoice extends BaseEntity {
  /**
   * 주문번호
   */
  @Column({ unique: true, length: 27 })
  orderNumber: string;

  /**
   * 유저 ID
   */
  @Column()
  userId: number;

  /**
   * 주문 상태
   */
  @Column({
    type: 'enum',
    enum: InvoiceState,
    default: InvoiceState.DRAFT,
  })
  state: InvoiceState;

  /**
   * 상품 ID
   */
  @Column()
  productId: number;

  @ManyToOne(() => Product, (product) => product.invoices)
  product: Product;

  /**
   * 구매 수량
   */
  @Column('float')
  amount: number;

  /**
   * 구매 가격
   */
  @Column('int')
  price: number;

  /**
   * 우편번호
   */
  @Column({ nullable: true, length: 6 })
  zipcode?: string;

  /**
   * 배송 주소
   */
  @Column({ nullable: true, length: 255 })
  shippingAddress?: string;

  /**
   * 배송 주소 상세
   */
  @Column({ nullable: true, length: 255 })
  shippingAddressDetail?: string;

  /**
   * 수령인
   */
  @Column({ nullable: true, length: 255 })
  shippingName?: string;

  /**
   * 수령인 전화번호
   */
  @Column({ nullable: true, length: 15 })
  shippingPhoneNumber?: string;

  /**
   * 거래 유형
   */
  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;
}
