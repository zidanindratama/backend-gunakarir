import { Module } from '@nestjs/common';
import { RecruitmentStagesService } from './recruitment-stages.service';
import { RecruitmentStagesController } from './recruitment-stages.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [RecruitmentStagesService],
  controllers: [RecruitmentStagesController],
})
export class RecruitmentStagesModule {}
