import { IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { InvoiceState } from 'src/entity/invoice.entity';

export class UpdateInvoiceStateDto {
  /**
   * orderNumber
   * @example "240901-VQSH1MRV"
   */
  @IsString()
  orderNumber: string;

  /**
   * 업데이트할 invoice 상태
   * @example 'PAYMENT_COMPLETED'
   */
  @IsEnum(InvoiceState)
  invoiceState: InvoiceState;

  /**
   * 결제 가격
   * @example 14000
   */
  @ValidateIf((o) => o.invoiceState === InvoiceState.PAYMENT_COMPLETED)
  @IsNotEmpty({
    message:
      'Payment amount is required when the invoice state is PAYMENT_COMPLETED',
  })
  paymentAmount?: number;
}
