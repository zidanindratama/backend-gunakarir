import { Module } from '@nestjs/common';
import { StudyProgramsService } from './study-programs.service';
import { StudyProgramsController } from './study-programs.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [StudyProgramsService],
  controllers: [StudyProgramsController],
})
export class StudyProgramsModule {}
