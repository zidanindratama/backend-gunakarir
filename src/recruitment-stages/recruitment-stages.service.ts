import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecruitmentStageCreateDto } from './dtos/recruitment-stage-create.dto';
import { InterviewCreateDto } from './dtos/interview-create.dto';
import { RecruitmentStageUpdateDto } from './dtos/recruitment-stage-update.dto';

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

    await this.prisma.recruitmentStage.deleteMany({
      where: {
        application_id: applicationId,
        NOT: { stage_type: dto.stage_type },
      },
    });

    const stage = await this.prisma.recruitmentStage.create({
      data: {
        application_id: applicationId,
        stage_type: dto.stage_type,
        notes: dto.notes,
      },
    });

    if (interviewDto) {
      await this.prisma.interview.create({
        data: {
          application_id: applicationId,
          type:
            dto.stage_type === 'HR_INTERVIEW'
              ? 'HR'
              : dto.stage_type === 'MANAGEMENT_INTERVIEW'
                ? 'MANAGEMENT'
                : null,
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

  async updateStage(stageId: string, dto: RecruitmentStageUpdateDto) {
    const existing = await this.prisma.recruitmentStage.findUnique({
      where: { id: stageId },
      include: {
        application: {
          include: {
            interviews: true,
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Tahapan tidak ditemukan.');
    }

    const wasInterview =
      existing.stage_type === 'HR_INTERVIEW' ||
      existing.stage_type === 'MANAGEMENT_INTERVIEW';

    const nowInterview =
      dto.stage_type === 'HR_INTERVIEW' ||
      dto.stage_type === 'MANAGEMENT_INTERVIEW';

    if (
      existing.stage_type === 'CV_SCREENING' &&
      nowInterview &&
      existing.application.interviews.length === 0
    ) {
      throw new BadRequestException(
        'Tidak dapat mengubah dari CV Screening ke tahapan interview. Gunakan fitur "Ubah Tahapan Aktif" untuk melanjutkan.',
      );
    }

    if (wasInterview && !nowInterview) {
      await this.prisma.interview.deleteMany({
        where: { application_id: existing.application_id },
      });
    }

    if (
      wasInterview &&
      nowInterview &&
      existing.stage_type !== dto.stage_type
    ) {
      await this.prisma.interview.updateMany({
        where: { application_id: existing.application_id },
        data: {
          type: dto.stage_type === 'HR_INTERVIEW' ? 'HR' : 'MANAGEMENT',
        },
      });
    }

    if (dto.stage_type && dto.stage_type !== existing.stage_type) {
      await this.prisma.recruitmentStage.deleteMany({
        where: {
          application_id: existing.application_id,
          NOT: { id: stageId },
        },
      });
    }

    const updatedStage = await this.prisma.recruitmentStage.update({
      where: { id: stageId },
      data: {
        stage_type: dto.stage_type,
        notes: nowInterview ? dto.notes : null,
      },
    });

    if (dto.final_status) {
      await this.prisma.application.update({
        where: { id: existing.application_id },
        data: {
          status: dto.final_status,
        },
      });
    }

    return updatedStage;
  }
}
