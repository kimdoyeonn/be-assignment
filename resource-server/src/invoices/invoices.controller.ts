import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceStateDto } from './dto/update-invoice-state.dto';
import { UpdateShippingDetailDto } from './dto/update-shipping-detail.dto';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { InvoiceQueryDto } from './dto/invoice-query.dto';
import { Invoice } from 'src/entity/invoice.entity';
import { ApiResponseDto } from 'src/common/dto/api-response.dto';

@ApiTags('invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  /**
   * 인보이스 목록을 조회합니다.
   * @param invoiceQueryDto - 인보이스 조회 조건
   * @returns 조회된 인보이스 목록
   */
  @Get()
  async getInvoices(
    @Param() invoiceQueryDto: InvoiceQueryDto,
  ): Promise<{ data: { invoices: Invoice[] } }> {
    // TODO 유저 검증
    const userId = 2;
    const { minDate, maxDate, limit, offset, invoiceType } = invoiceQueryDto;

    const invoices = await this.invoicesService.getInvoices(userId, {
      minDate,
      maxDate,
      limit,
      offset,
      invoiceType,
    });

    return new ApiResponseDto(true, { invoices }, 'Success');
  }

  /**
   * 새로운 인보이스를 생성합니다.
   * @param createInvoiceDto - 인보이스 생성에 필요한 데이터
   * @returns 생성된 인보이스의 orderNumber
   */
  @ApiCreatedResponse({
    description: '생성완료',
    example: {
      orderNumber: '240909-69MKSFLK',
    },
  })
  @ApiBadRequestResponse({
    description: '상품 유형이 맞지 않거나 가격이 일치하지 않을 경우',
    example: {
      message: 'Invalid Product type',
      error: 'Bad Request',
      statusCode: 400,
    },
  })
  @ApiConflictResponse({
    description: '상품의 재고가 부족할 경우',
    example: {
      message: 'Insufficient stock for the requested item.',
      error: 'Conflict',
      statusCode: 409,
    },
  })
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

    return new ApiResponseDto(
      true,
      { orderNumber: invoice.orderNumber },
      'Success',
    );
  }

  /**
   * 인보이스 배송정보를 업데이트합니다.
   * @param UpdateShippingDetailDto - 인보이스 배송정보를 업데이트할 때 필요한 정보
   */
  @ApiBadRequestResponse({
    description: '인보이스가 존재하지 않을 경우',
    example: {
      message: 'Invalid Invoice',
      error: 'Bad Request',
      statusCode: 400,
    },
  })
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

  /**
   * 인보이스 상태 업데이트
   * @param updateInvoiceStateDto - 인보이스 상태 업데이트에 필요한 데이터
   */
  @ApiConflictResponse({
    description:
      '인보이스가 존재하지 않거나 결제 금액이 인보이스 금액과 일치하지 않을 경우 발생',
    example: {
      message: 'Mismatched price',
      error: 'Bad Request',
      statusCode: 400,
    },
  })
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
