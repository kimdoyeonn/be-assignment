import { Controller, Post } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * 상품 더미데이터를 생성합니다.
   */
  @ApiCreatedResponse({
    description: '생성 완료',
  })
  @Post('/dummy')
  async createDummy() {
    await this.productsService.createInitialProduct();
  }
}
