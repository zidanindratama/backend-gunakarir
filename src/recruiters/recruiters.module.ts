import { Module } from '@nestjs/common';
import { RecruitersService } from './recruiters.service';
import { RecruitersController } from './recruiters.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MailerService } from '../mailer/mailer.service';

@Module({
  imports: [PrismaModule],
  controllers: [RecruitersController],
  providers: [RecruitersService, MailerService],
})
export class RecruitersModule {}
