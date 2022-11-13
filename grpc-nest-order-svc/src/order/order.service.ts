import { HttpStatus, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { CreateOrderRequestDto } from './order.dto';
import { Order } from './order.entity';
import { CreateOrderResponse } from './order.pb';
import {
  DecreaseStockResponse,
  FindOneResponse,
  ProductServiceClient,
  PRODUCT_SERVICE_NAME,
} from './proto/product.pb';

@Injectable()
export class OrderService implements OnModuleInit {
  private productSvc: ProductServiceClient;

  @Inject(PRODUCT_SERVICE_NAME)
  private readonly client: ClientGrpc;

  @InjectRepository(Order)
  private readonly repository: Repository<Order>;

  public onModuleInit() {
    this.productSvc =
      this.client.getService<ProductServiceClient>(PRODUCT_SERVICE_NAME);
  }

  public async createOrder(
    order: CreateOrderRequestDto,
  ): Promise<CreateOrderResponse> {
    const product: FindOneResponse = await firstValueFrom(
      this.productSvc.findOne({ id: order.productId }),
    );

    if (product.status >= HttpStatus.NOT_FOUND) {
      return { id: null, error: ['Product not found'], status: product.status };
    } else if (product.data.stock < order.quantity) {
      return {
        id: null,
        error: ['Insufficient stock'],
        status: HttpStatus.CONFLICT,
      };
    }

    const newOrder: Order = new Order();
    newOrder.productId = order.productId;
    newOrder.userId = order.userId;
    newOrder.price = product.data.price;

    await this.repository.save(newOrder);

    const decreasedStockData: DecreaseStockResponse = await firstValueFrom(
      this.productSvc.decreaseStock({
        id: order.productId,
        orderId: newOrder.id,
        quantity: order.quantity,
      }),
    );

    if (decreasedStockData.status === HttpStatus.CONFLICT) {
      await this.repository.delete(newOrder.id);
      return {
        id: null,
        error: decreasedStockData.error,
        status: HttpStatus.CONFLICT,
      };
    }

    return { id: newOrder.id, error: null, status: HttpStatus.CREATED };
  }
}
