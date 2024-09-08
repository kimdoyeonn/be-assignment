import { Controller, Post } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('/dummy')
  async createDummy() {
    await this.productsService.createInitialProduct();
  }
}
