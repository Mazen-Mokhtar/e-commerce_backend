import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { orderRepository } from 'src/DB/models/Order/order.repository';
import { ProductRepository } from 'src/DB/models/Product/product.repository';
import { UserRepository } from 'src/DB/models/User/user.repository';
import { orderModel } from 'src/DB/models/Order/order.model';
import { productModel } from 'src/DB/models/Product/product.model';
import { UserModel } from 'src/DB/models/User/user.model';

@Module({
  imports: [
    orderModel,
    productModel,
    UserModel,
  ],
  controllers: [DashboardController],
  providers: [
    DashboardService,
    orderRepository,
    ProductRepository,
    UserRepository,
  ],
})
export class DashboardModule {} 