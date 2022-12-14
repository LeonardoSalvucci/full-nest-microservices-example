import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import {
  FindOneRequest,
  CreateProductRequest,
  DecreaseStockRequest,
} from './product.pb';

export class FindOneRequestDto implements FindOneRequest {
  @IsNumber({ allowInfinity: false, allowNaN: false })
  public readonly id: number;
}

export class CreateProductRequestDto implements CreateProductRequest {
  @IsString()
  @IsNotEmpty()
  public readonly name: string;

  @IsString()
  @IsNotEmpty()
  public readonly sku: string;

  @IsNumber({ allowInfinity: false, allowNaN: false })
  public readonly stock: number;

  @IsNumber({ allowInfinity: false, allowNaN: false })
  public readonly price: number;
}

export class DecreaseStockRequestDto implements DecreaseStockRequest {
  @IsNumber({ allowInfinity: false, allowNaN: false })
  public readonly id: number;

  @IsNumber()
  @Min(1)
  public readonly quantity: number;

  @IsNumber({ allowInfinity: false, allowNaN: false })
  public readonly orderId: number;
}
