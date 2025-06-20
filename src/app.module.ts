import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UserModule } from './User/user.module';
import { categoryModule } from './modules/category/category.module';
import { ProductModule } from './modules/product/product.module';
import { CartModule } from './modules/cart/cart.module';
import { OrderModule } from './modules/order/order.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.DB_URL as string),
    EventEmitterModule.forRoot(),
    AuthModule,
    UserModule,
    categoryModule,
    ProductModule,
    CartModule,
    OrderModule,
    CouponModule,
    DashboardModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
