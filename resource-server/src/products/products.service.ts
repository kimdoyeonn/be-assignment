import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product, TransactionType } from 'src/entity/product.entity';
import { CreateInvoiceDto } from 'src/invoices/dto/create-invoice.dto';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * 주어진 id로 product를 조회
   *
   * @param id - product의 id
   * @returns product 객체를 반환
   * @throws BadRequestException - product가 존재하지 않을 경우 발생
   */
  async findOneByIdOrFail(id: Product['id']) {
    const product = await this.productRepository.findOne({
      where: { id },
      select: [
        'id',
        'amount',
        'name',
        'price',
        'purity',
        'type',
        'createdAt',
        'updatedAt',
      ],
    });

    if (product === null) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  /**
   * 인보이스를 생성하기 전에 상품 정보를 검증
   * @param productId - 검증할 상품의 id
   * @param type - 거래 유형(판매 | 구매)
   * @param amount - 요청된 상품의 수량
   * @param price - 요청된 상품의 가격
   * @returns 상품 객체 반환
   * @throws BadRequestException 상품 유형이 맞지 않거나 가격이 일치하지 않을 경우 발생
   * @throws ConflictException 상품의 재고가 부족할 경우 발생
   */
  async validateProduct(createInvoiceDto: CreateInvoiceDto) {
    const { productId, amount, price, type } = createInvoiceDto;

    const product = await this.findOneByIdOrFail(productId);
    const calculatedPriceByProduct = amount * product.price;

    if (product.type !== type) {
      throw new BadRequestException('Invalid Product type');
    }

    // 상품 유형과 가격이 올바른지 확인합니다. 둘 중 하나라도 맞지 않으면 예외를 발생
    if (calculatedPriceByProduct !== price) {
      throw new BadRequestException('Mismatched price');
    }

    if (product.amount < amount) {
      throw new ConflictException('Insufficient stock for the requested item.');
    }

    return product;
  }

  /**
   * 상품의 수량을 확인하고 수량을 줄여 업데이트
   * @param id - 샹품의 id
   * @param amount - 판매될 상품의 양
   * @throw ConflictException - 상품의 재고가 남아있지 않을 경우 발생
   */
  async decreaseProductAmount(id: Product['id'], amount: number) {
    const product = await this.findOneByIdOrFail(id);

    if (product.amount < amount) {
      throw new ConflictException('Insufficient stock for the requested item.');
    }

    await this.productRepository.update(
      { id },
      { amount: product.amount - amount },
    );
  }

  /**
   * 상품 더미데이터를 생성합니다.
   */
  async createInitialProduct() {
    await this.productRepository.insert({
      name: '99.9% 금',
      purity: 99.9,
      amount: 100,
      price: 100,
      type: TransactionType.SALE,
    });
    await this.productRepository.insert({
      name: '99.9% 금',
      purity: 99.9,
      amount: 100,
      price: 100,
      type: TransactionType.PURCHASE,
    });
    await this.productRepository.insert({
      name: '99.99% 금',
      purity: 99.9,
      amount: 100,
      price: 100,
      type: TransactionType.SALE,
    });
    await this.productRepository.insert({
      name: '99.99% 금',
      purity: 99.9,
      amount: 100,
      price: 100,
      type: TransactionType.PURCHASE,
    });
  }
}
