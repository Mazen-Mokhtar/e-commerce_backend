import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('revenue-trend')
  getRevenueTrend(@Query('period') period: string) {
    return this.dashboardService.getRevenueTrend(period);
  }

  @Get('top-products')
  getTopProducts(@Query('limit') limit: number) {
    return this.dashboardService.getTopProducts(limit);
  }

  @Get('customer-activity')
  getCustomerActivity() {
    return this.dashboardService.getCustomerActivity();
  }
} 