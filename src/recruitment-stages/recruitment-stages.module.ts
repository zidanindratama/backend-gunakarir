import { Module } from '@nestjs/common';
import { RecruitmentStagesService } from './recruitment-stages.service';
import { RecruitmentStagesController } from './recruitment-stages.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MailerService } from '../mailer/mailer.service';

@Module({
  imports: [PrismaModule],
  providers: [RecruitmentStagesService, MailerService],
  controllers: [RecruitmentStagesController],
})
export class RecruitmentStagesModule {}
