import { Controller, Get, Query, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Request } from 'express';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Roles('RECRUITER')
  @Get('recruiter')
  async getRecruiterDashboard(@Req() req: Request) {
    const userId = req.user.id;
    return this.dashboardService.getRecruiterDashboard(userId);
  }

  @Roles('ADMIN')
  @Get('admin')
  async getAdminDashboard() {
    return this.dashboardService.getAdminDashboard();
  }

  @Roles('RECRUITER')
  @Get('job-type-pie-stats')
  async getJobTypePieStats(@Req() req: Request) {
    const userId = req.user.id;
    const month = req.query.month as string | undefined;
    return this.dashboardService.getJobTypePieStats(userId, month);
  }

  @Roles('RECRUITER')
  @Get('job-type-ine-stats')
  async getJobTypeLineStats(@Req() req: Request) {
    const userId = req.user['sub'];
    const data = await this.dashboardService.getJobTypeLineStats(userId);
    return { data };
  }

  @Roles('ADMIN')
  @Get('job-type-bar-stats')
  getJobTypeBarStats() {
    return this.dashboardService.getJobTypeBarStats();
  }
}
