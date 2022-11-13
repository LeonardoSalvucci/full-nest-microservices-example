import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class StockDecreaseLog extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  // Relations

  @Column({ type: 'integer' })
  public orderId!: number;

  // Many To Many Relations

  @ManyToOne(() => Product, (product) => product.stockDecreaseLogs)
  public product: Product;
}
