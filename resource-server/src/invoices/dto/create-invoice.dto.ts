import { IsEnum, IsNumber } from 'class-validator';
import { TransactionType } from 'src/entity/product.entity';

export class CreateInvoiceDto {
  /**
   * 상품 id
   * @example 2
   */
  @IsNumber()
  productId: number;

  /**
   * 구매 가격
   * @example 14000
   */
  @IsNumber()
  price: number;

  /**
   * 구매 수량
   * @example 12.23
   */
  @IsNumber({ maxDecimalPlaces: 2 })
  amount: number;

  /**
   * 판매 / 구매
   * @example 'SALE'
   */
  @IsEnum(TransactionType)
  type: TransactionType;
}
