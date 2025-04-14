import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { AppService } from './app.service';
import { Roles } from './common/decorators/roles.decorator';

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

  @Roles('RECRUITER')
  @Get('recruiter')
  getHRContent() {
    return 'Hanya untuk Recruiter';
  }

  @Roles('MAHASISWA')
  @Get('mahasiswa')
  getMahasiswaContent(@Req() req: Request) {
    return 'Hanya untuk mahasiswa';
  }
}
