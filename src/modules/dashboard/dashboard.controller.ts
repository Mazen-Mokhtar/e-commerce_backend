import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from 'src/commen/Guards/auth.guard';
import { RolesGuard } from 'src/commen/Guards/role.guard';
import { RoleTypes } from 'src/DB/models/User/user.schema';
import { Roles } from 'src/commen/Decorator/roles.decorator';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @Get('revenue-trend')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles([RoleTypes.ADMIN])
  getRevenueTrend(@Query('period') period: string) {
    return this.dashboardService.getRevenueTrend(period);
  }

  @Get('top-products')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles([RoleTypes.ADMIN])
  getTopProducts(@Query('limit') limit: number) {
    return this.dashboardService.getTopProducts(limit);
  }

  @Get('customer-activity')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles([RoleTypes.ADMIN])
  getCustomerActivity() {
    return this.dashboardService.getCustomerActivity();
  }
} 