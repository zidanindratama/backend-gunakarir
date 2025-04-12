import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { AppService } from './app.service';
import { Roles } from './auth/decorators/roles.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Roles('ADMIN')
  @Get('admin')
  getAdminContent() {
    return 'Hanya untuk admin';
  }

  @Roles('ADMIN')
  @Get('hr')
  getHRContent() {
    return 'Hanya untuk HR/Admin';
  }

  @Roles('MAHASISWA')
  @Get('mahasiswa')
  getMahasiswaContent(@Req() req: Request) {
    return 'Hanya untuk mahasiswa';
  }
}
