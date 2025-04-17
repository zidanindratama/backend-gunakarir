import { Module } from '@nestjs/common';
import { ProfileSettingService } from './profile-setting.service';
import { ProfileSettingController } from './profile-setting.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MailerService } from 'src/mailer/mailer.service';

@Module({
  imports: [PrismaModule],
  controllers: [ProfileSettingController],
  providers: [ProfileSettingService, MailerService],
})
export class ProfileSettingModule {}
