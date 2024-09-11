import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceStateDto } from './dto/update-invoice-state.dto';
import { UpdateShippingDetailDto } from './dto/update-shipping-detail.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { InvoiceQueryDto } from './dto/invoice-query.dto';
import { ApiResponseDto } from 'src/common/dto/api-response.dto';
import InvoiceResponseDto from './dto/invoice-response.dto';
import InvoiceDetailResponseDto from './dto/invoice-detail-response.dto';
import { AuthService } from 'src/auth/auth.service';
import { AuthenticatedUser } from 'src/common/decorators/authenticated-user';
import { InvoiceState } from 'src/entity/invoice.entity';

@ApiTags('invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly authService: AuthService,
  ) {}

  /**
   * 인보이스 목록을 조회합니다.
   * @param invoiceQueryDto - 인보이스 조회 조건
   * @returns 조회된 인보이스 목록
   */
  @ApiBearerAuth()
  @Get()
  async getInvoices(
    @AuthenticatedUser() user: { userId: number; username: string },
    @Query() invoiceQueryDto: InvoiceQueryDto,
  ): Promise<ApiResponseDto<{ invoices: InvoiceResponseDto[] }>> {
    const { minDate, maxDate, limit, offset, invoiceType } = invoiceQueryDto;

    const { invoices, count } = await this.invoicesService.getInvoices(
      user.userId,
      {
        minDate,
        maxDate,
        limit,
        offset,
        invoiceType,
      },
    );

    return new ApiResponseDto(true, { invoices, count }, 'Success');
  }

  /**
   * orderNumber에 해당하는 인보이스를 조회합니다.
   * @param orderNumber - 주문번호
   * @returns 조회한 인보이스
   */
  @ApiBearerAuth()
  @Get(':orderNumber')
  async getInvoice(
    @AuthenticatedUser() user: { userId: number; username: string },
    @Param('orderNumber') orderNumber,
  ): Promise<ApiResponseDto<{ invoice: InvoiceDetailResponseDto }>> {
    const invoice = await this.invoicesService.getInvoice(
      user.userId,
      orderNumber,
    );
    return new ApiResponseDto(true, { invoice }, 'Success');
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
  @ApiBearerAuth()
  @Post()
  async createInvoice(
    @AuthenticatedUser() user: { userId: number; username: string },
    @Body() createInvoiceDto: CreateInvoiceDto,
  ) {
    const { productId, price, amount, type } = createInvoiceDto;

    const invoice = await this.invoicesService.createInvoice(user.userId, {
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
  @ApiBearerAuth()
  @Patch('/shipping')
  async updateShippingDetail(
    @AuthenticatedUser() user: { userId: number; username: string },
    @Body() UpdateShippingDetailDto: UpdateShippingDetailDto,
  ) {
    const { orderNumber, shippingAddress, zipcode } = UpdateShippingDetailDto;

    await this.invoicesService.updateShippingDetail(user.userId, {
      orderNumber,
      shippingAddress,
      zipcode,
    });

    return new ApiResponseDto(true, null, 'Success');
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
  @ApiBearerAuth()
  @Patch('/state')
  async updateInvoiceState(
    @AuthenticatedUser() user: { userId: number; username: string },
    @Body() updateInvoiceStateDto: UpdateInvoiceStateDto,
  ) {
    const { orderNumber, invoiceState, paymentAmount } = updateInvoiceStateDto;

    await this.invoicesService.updateInvoiceState(user.userId, {
      orderNumber,
      invoiceState,
      paymentAmount,
    });

    return new ApiResponseDto(true, null, 'Success');
  }

  @ApiBearerAuth()
  @Patch('/:orderNumber/cancel')
  async cancelInvoice(
    @AuthenticatedUser() user: { userId: number; username: string },
    @Param('orderNumber') orderNumber: string,
  ) {
    await this.invoicesService.updateInvoiceState(user.userId, {
      invoiceState: InvoiceState.CANCELED,
      orderNumber,
    });

    return new ApiResponseDto(true, null, 'Success');
  }
}
