import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Invoice, InvoiceState } from 'src/entity/invoice.entity';
import { Between, Not, Repository } from 'typeorm';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { ProductsService } from 'src/products/products.service';
import { UpdateInvoiceStateDto } from './dto/update-invoice-state.dto';
import { formatDateYYMMDD } from 'src/utils/date.utils';
import { UpdateShippingDetailDto } from './dto/update-shipping-detail.dto';
import { InvoiceQueryDto } from './dto/invoice-query.dto';
import InvoiceDetailResponseDto from './dto/invoice-detail-response.dto';
import InvoiceResponseDto from './dto/invoice-response.dto';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    private readonly productsService: ProductsService,
  ) {}

  /**
   * 주어진 조건에 맞는 인보이스를 조회합니다.
   * @param userId - 사용자 ID
   * @param invoiceQueryDto - 조회 조건
   * @returns 조회된 인보이스 목록
   */
  async getInvoices(
    userId,
    invoiceQueryDto: InvoiceQueryDto,
  ): Promise<InvoiceResponseDto[]> {
    const { minDate, maxDate, offset, limit, invoiceType } = invoiceQueryDto;

    const invoices = await this.invoiceRepository.find({
      select: [
        'orderNumber',
        'userId',
        'state',
        'productId',
        'amount',
        'price',
        'createdAt',
      ],
      where: {
        userId,
        createdAt: Between(
          minDate || new Date('1900-01-01'),
          maxDate || new Date(),
        ),
        ...(invoiceType !== null ? { type: invoiceType } : {}),
        state: Not(InvoiceState.DRAFT),
      },
      skip: offset,
      take: limit,
      relations: ['product'],
    });

    return invoices;
  }

  async getInvoice(
    userId: Invoice['userId'],
    orderNumber: Invoice['orderNumber'],
  ): Promise<InvoiceDetailResponseDto> {
    const invoice = await this.invoiceRepository.findOne({
      select: [
        'orderNumber',
        'userId',
        'state',
        'productId',
        'amount',
        'price',
        'createdAt',
        'shippingAddress',
        'shippingAddressDetail',
        'shippingName',
        'shippingPhoneNumber',
      ],
      where: { userId, orderNumber },
      relations: ['product'],
    });

    return invoice;
  }

  /**
   * 주어진 ID로 인보이스를 조회
   *
   * @param id - 인보이스의 ID
   * @returns 조회된 인보이스 객체를 반환
   * @throws BadRequestException - 인보이스가 존재하지 않을 경우 발생
   */
  async findOneByIdOrFail(id: Invoice['id']) {
    const invoice = await this.invoiceRepository.findOneBy({ id });

    if (invoice === null) {
      throw new BadRequestException('Invalid Invoice');
    }

    return invoice;
  }

  /**
   * 주어진 orderNumber로 인보이스를 조회
   *
   * @param orderNumber - 인보이스의 orderNumber
   * @returns 조회된 인보이스 객체 반환
   * @throws BadRequestException - 인보이스가 존재하지 않을 경우 발생
   */
  async findOneByOrderNumberOrFail(orderNumber: Invoice['orderNumber']) {
    const invoice = await this.invoiceRepository.findOneBy({ orderNumber });

    if (invoice === null) {
      throw new BadRequestException('Invalid Invoice');
    }

    return invoice;
  }

  /**
   * 랜덤 orderNumber를 생성합니다.
   * @returns 생성된 orderNumber를 반환
   */
  private generateRandomOrderNumber(): string {
    const now = new Date();
    const randomPart = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();
    return `${formatDateYYMMDD(now)}-${randomPart}`;
  }

  /**
   * 새로운 인보이스를 생성합니다.
   *
   * @param userId - 인보이스를 생성하는 사용자의 id
   * @param createInvoiceDto - 인보이스 생성에 필요한 데이터
   * @returns 생성된 인보이스 객체를 반환
   * @throws BadRequestException - 상품 정보가 올바르지 않을 경우 발생
   */
  async createInvoice(userId: number, createInvoiceDto: CreateInvoiceDto) {
    const { productId, amount, price, type } = createInvoiceDto;
    // 상품의 정보가 올바른지 검사합니다.
    await this.productsService.validateProduct({
      productId,
      amount,
      price,
      type,
    });

    // 상품의 수량을 줄입니다.
    await this.productsService.decreaseProductAmount(productId, amount);

    const orderNumber = this.generateRandomOrderNumber();

    const result = await this.invoiceRepository.save({
      productId,
      type,
      amount,
      price,
      userId,
      orderNumber,
      state: InvoiceState.DRAFT,
    });

    return result;
  }

  /**
   * 인보이스 배송정보를 업데이트합니다.
   * @param updateShippingDetailDto - 인보이스 배송정보를 업데이트할 때 필요한 정보
   * @throws BadRequestException - 인보이스가 존재하지 않을 경우 발생
   * @throws UnauthorizedException - 유저 정보가 올바르지 않은 경우 발생
   */
  async updateShippingDetail(
    userId: number,
    updateShippingDetailDto: UpdateShippingDetailDto,
  ) {
    const { orderNumber, shippingAddress, zipcode } = updateShippingDetailDto;
    const invoice = await this.findOneByOrderNumberOrFail(orderNumber);

    if (invoice.userId !== userId) {
      throw new UnauthorizedException();
    }

    await this.invoiceRepository.update(
      { orderNumber },
      { shippingAddress, zipcode, state: InvoiceState.ORDER_COMPLETED },
    );
  }

  /**
   * 인보이스 상태를 변경하기 전에 유효성을 검사합니다.
   *
   * @param updateInvoiceStateDto - 인보이스 상태 변경에 필요한 데이터
   * @returns 인보이스 객체를 반환
   * @throws ConflictException - 결제 금액이 인보이스 금액과 일치하지 않을 경우 발생
   * @throws UnauthorizedException - 유저 정보가 올바르지 않은 경우 발생
   */
  async validateInvoice(
    userId: number,
    updateInvoiceStateDto: UpdateInvoiceStateDto,
  ) {
    const { orderNumber, invoiceState, paymentAmount } = updateInvoiceStateDto;

    const invoice = await this.findOneByOrderNumberOrFail(orderNumber);

    if (invoice.userId !== userId) {
      throw new UnauthorizedException();
    }

    if (
      invoiceState === InvoiceState.PAYMENT_COMPLETED &&
      invoice.price !== paymentAmount
    ) {
      // PAYMENT_COMPLETED 상태로 업데이트하면서 결제 금액이 올바르지 않을 경우 예외를 발생시킵니다.
      throw new ConflictException('Mismatched price');
    }

    return invoice;
  }

  /**
   * 인보이스의 상태를 업데이트
   *
   * @param updateInvoiceStateDto - 인보이스 상태 업데이트에 필요한 데이터
   */
  async updateInvoiceState(
    userId: number,
    updateInvoiceStateDto: UpdateInvoiceStateDto,
  ) {
    const { orderNumber, invoiceState, paymentAmount } = updateInvoiceStateDto;
    // 인보이스 정보가 올바른지 확인합니다.
    await this.validateInvoice(userId, {
      orderNumber,
      invoiceState,
      paymentAmount,
    });

    await this.invoiceRepository.update(
      { orderNumber },
      { state: invoiceState },
    );
  }
}
