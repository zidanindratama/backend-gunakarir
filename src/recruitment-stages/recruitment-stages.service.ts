import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecruitmentStageCreateDto } from './dtos/recruitment-stage-create.dto';
import { InterviewCreateDto } from './dtos/interview-create.dto';

@Injectable()
export class RecruitmentStagesService {
  constructor(private prisma: PrismaService) {}

  async addStage(
    applicationId: string,
    dto: RecruitmentStageCreateDto,
    interviewDto?: InterviewCreateDto,
  ) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Lamaran tidak ditemukan.');
    }

    const stage = await this.prisma.recruitmentStage.create({
      data: {
        application_id: applicationId,
        stage_type: dto.stage_type,
        notes: dto.notes,
      },
    });

    if (['HR_INTERVIEW', 'MANAGEMENT_INTERVIEW'].includes(dto.stage_type)) {
      if (!interviewDto) {
        throw new BadRequestException(
          'Data interview wajib diisi untuk tahapan interview.',
        );
      }

      await this.prisma.interview.create({
        data: {
          application_id: applicationId,
          type: dto.stage_type === 'HR_INTERVIEW' ? 'HR' : 'MANAGEMENT',
          schedule: interviewDto.schedule,
          confirm_deadline: interviewDto.confirm_deadline,
          method: interviewDto.method,
          link: interviewDto.link,
          location: interviewDto.location,
          notes: interviewDto.notes,
        },
      });
    }

    return stage;
  }
}
