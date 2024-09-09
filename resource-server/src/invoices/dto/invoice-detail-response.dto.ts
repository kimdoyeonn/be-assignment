import { OmitType } from '@nestjs/swagger';
import { Invoice } from 'src/entity/invoice.entity';

class InvoiceDetailResponseDto extends OmitType(Invoice, ['updatedAt', 'id']) {}

export default InvoiceDetailResponseDto;
