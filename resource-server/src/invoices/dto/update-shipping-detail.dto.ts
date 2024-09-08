import { IsString, Length } from 'class-validator';
import { Invoice } from 'src/entity/invoice.entity';

export class UpdateShippingDetailDto {
  /**
   * 주문번호
   * @example "240901-VQSH1MRV"
   */
  @IsString()
  orderNumber: Invoice['orderNumber'];

  /**
   * 배송 주소
   * @example 서울시 영등포구 국회대로123번길
   */
  @IsString()
  shippingAddress: Invoice['shippingAddress'];

  /**
   * 우편번호
   * @example 12345
   */
  @IsString()
  @Length(5, 5)
  zipcode: Invoice['zipcode'];
}
