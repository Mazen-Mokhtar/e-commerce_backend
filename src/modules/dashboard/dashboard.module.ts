import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { orderRepository } from 'src/DB/models/Order/order.repository';
import { ProductRepository } from 'src/DB/models/Product/product.repository';
import { UserRepository } from 'src/DB/models/User/user.repository';
import { orderModel } from 'src/DB/models/Order/order.model';
import { productModel } from 'src/DB/models/Product/product.model';
import { UserModel } from 'src/DB/models/User/user.model';
import { SharedModule } from 'src/commen/sharedModules';

@Module({
  imports: [
    orderModel,
    productModel,
    SharedModule,
  ],
  controllers: [DashboardController],
  providers: [
    DashboardService,
    orderRepository,
    ProductRepository,

  ],
})
export class DashboardModule { } 