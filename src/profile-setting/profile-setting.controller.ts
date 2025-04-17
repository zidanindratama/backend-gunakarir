import { Body, Controller, Get, Patch, Req } from '@nestjs/common';
import { Request } from 'express';
import { ProfileSettingService } from './profile-setting.service';
import { ProfileSettingUpdateDto } from './dtos/profile-setting-update.dto';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('api/profile-setting')
export class ProfileSettingController {
  constructor(private profileSettingService: ProfileSettingService) {}

  @Get('me')
  getMe(@Req() req: Request) {
    return req.user;
  }

  @Roles('MAHASISWA')
  @Patch('update')
  updateMahasiswa(@Req() req: Request, @Body() body: ProfileSettingUpdateDto) {
    const user = req.user;
    return this.profileSettingService.updateMyProfile(user.id, body);
  }
}
