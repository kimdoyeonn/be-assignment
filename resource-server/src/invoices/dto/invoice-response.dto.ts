import { OmitType } from '@nestjs/swagger';
import { Invoice } from 'src/entity/invoice.entity';

class InvoiceResponseDto extends OmitType(Invoice, [
  'id',
  'zipcode',
  'shippingAddress',
  'shippingAddressDetail',
  'shippingName',
  'shippingPhoneNumber',
]) {}

export default InvoiceResponseDto;
