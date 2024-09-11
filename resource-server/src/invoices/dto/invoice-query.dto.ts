import { Transform } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  Matches,
  ValidateIf,
} from 'class-validator';
import { TransactionType } from 'src/entity/product.entity';

/**
 * 인보이스 목록 조회에 사용할 조건
 */
export class InvoiceQueryDto {
  /**
   * 최소 일자
   * @example 2024-09-01
   */
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in YYYY-MM-DD format',
  })
  @Transform(({ value }) => new Date(value), { toClassOnly: true })
  @IsDate()
  minDate?: Date;

  /**
   * 최대 일자
   * @example 2024-09-09
   */
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in YYYY-MM-DD format',
  })
  @Transform(({ value }) => new Date(value), { toClassOnly: true })
  @IsDate()
  maxDate?: Date;

  /**
   * 인보이스 데이터 수 제한(pagination)
   * @example 10
   */
  @IsOptional()
  @ValidateIf((o) => o.offset !== undefined)
  @IsNumber()
  limit?: number;

  /**
   * 건너뛸 인보이스 데이터 수(pagination)
   * @example 10
   */
  @IsOptional()
  @ValidateIf((o) => o.limit !== undefined)
  @IsNumber()
  offset?: number;

  @IsOptional()
  @IsEnum(TransactionType)
  invoiceType?: TransactionType;
}
