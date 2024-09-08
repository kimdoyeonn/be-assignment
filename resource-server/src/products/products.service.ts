import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product, TransactionType } from 'src/entity/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async createInitialProduct() {
    await this.productRepository.insert({
      name: '99.9% 금',
      purity: 99.9,
      amount: 100,
      type: TransactionType.SALE,
    });
    await this.productRepository.insert({
      name: '99.9% 금',
      purity: 99.9,
      amount: 100,
      type: TransactionType.PURCHASE,
    });
    await this.productRepository.insert({
      name: '99.99% 금',
      purity: 99.9,
      amount: 100,
      type: TransactionType.SALE,
    });
    await this.productRepository.insert({
      name: '99.99% 금',
      purity: 99.9,
      amount: 100,
      type: TransactionType.PURCHASE,
    });
  }
}
