import { Injectable } from '@nestjs/common';
import { orderRepository } from 'src/DB/models/Order/order.repository';
import { ProductRepository } from 'src/DB/models/Product/product.repository';
import { UserRepository } from 'src/DB/models/User/user.repository';

@Injectable()
export class DashboardService {
  constructor(
    private readonly orderRepository: orderRepository,
    private readonly productRepository: ProductRepository,
    private readonly userRepository: UserRepository,
  ) { }

  async getRevenueTrend(period: string) {
    // period: 'monthly' | 'daily'
    const groupBy = period === 'daily'
      ? { $dateToString: { format: '%Y-%m-%d', date: '$paidAt' } }
      : { $dateToString: { format: '%Y-%m', date: '$paidAt' } };
    const pipeline = [
      { $match: { status: 'delivered', paidAt: { $exists: true } } },
      {
        $group: {
          _id: groupBy,
          totalRevenue: { $sum: '$finalPrice' },
          count: { $sum: 1 },
        }
      },
      { $sort: { _id: 1 as 1 | -1 } },
    ];
    const data = await this.orderRepository.aggregate(pipeline);
    return {success : true , data}
  }

  async getTopProducts(limit: number = 5) {
    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : limit;
    const pipeline = [
      { $match: { status: 'delivered', paidAt: { $exists: true } } },
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.productId',
          name: { $first: '$products.name' },
          totalSold: { $sum: '$products.quantity' },
          totalRevenue: { $sum: '$products.finalPrice' },
        }
      },
      { $sort: { totalSold: -1 as -1 | 1 } },
      { $limit: parsedLimit },
    ];
    const data = await this.orderRepository.aggregate(pipeline);
    return { success: true, data }
  }

  async getCustomerActivity() {
    const pipeline = [
      { $match: { status: 'delivered', paidAt: { $exists: true } } },
      {
        $group: {
          _id: '$createdBy',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$finalPrice' },
          lastOrder: { $max: '$paidAt' },
        }
      },
      { $sort: { totalOrders: -1 as -1 | 1 } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          name: '$user.name',
          email: '$user.email',
          totalOrders: 1,
          totalSpent: 1,
          lastOrder: 1,
        },
      },
    ];
    const data = await this.orderRepository.aggregate(pipeline);
    return { success: true, data }
  }
} 