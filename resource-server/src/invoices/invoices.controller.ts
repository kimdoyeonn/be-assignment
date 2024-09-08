import { Body, Controller, Patch, Post } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceStateDto } from './dto/update-invoice-state.dto';
import { UpdateShippingDetailDto } from './dto/update-shipping-detail.dto';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  async createInvoice(@Body() createInvoiceDto: CreateInvoiceDto) {
    const { productId, price, amount, type } = createInvoiceDto;
    // TODO: token 검증
    const userId = 2;

    const invoice = await this.invoicesService.createInvoice(userId, {
      productId,
      price,
      amount,
      type,
    });

    return { orderNumber: invoice.orderNumber };
  }

  @Patch('/shipping')
  async updateShippingDetail(
    @Body() UpdateShippingDetailDto: UpdateShippingDetailDto,
  ) {
    const { orderNumber, shippingAddress, zipcode } = UpdateShippingDetailDto;
    // TODO: token 검증

    await this.invoicesService.updateShippingDetail({
      orderNumber,
      shippingAddress,
      zipcode,
    });
  }

  @Patch('/state')
  async updateInvoiceState(
    @Body() updateInvoiceStateDto: UpdateInvoiceStateDto,
  ) {
    const { orderNumber, invoiceState, paymentAmount } = updateInvoiceStateDto;
    // TODO: token 검증

    await this.invoicesService.updateInvoiceState({
      orderNumber,
      invoiceState,
      paymentAmount,
    });
  }
}
