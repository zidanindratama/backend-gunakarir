import { Module } from '@nestjs/common';
import { AiInterviewService } from './ai-interview.service';
import { AiInterviewController } from './ai-interview.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AiInterviewService],
  controllers: [AiInterviewController],
})
export class AiInterviewModule {}
