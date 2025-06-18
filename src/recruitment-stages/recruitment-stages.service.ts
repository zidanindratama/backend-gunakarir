import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecruitmentStageCreateDto } from './dtos/recruitment-stage-create.dto';
import { InterviewCreateDto } from './dtos/interview-create.dto';
import { RecruitmentStageUpdateDto } from './dtos/recruitment-stage-update.dto';
import { ApplicationStatus } from '@prisma/client';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class RecruitmentStagesService {
  constructor(
    private prisma: PrismaService,
    private mailerService: MailerService,
  ) {}

  async addStage(
    applicationId: string,
    dto: RecruitmentStageCreateDto,
    interviewDto?: InterviewCreateDto,
    finalStatus?: ApplicationStatus,
  ) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Lamaran tidak ditemukan.');
    }

    const isTryingToLolos = finalStatus === 'ACCEPTED';

    const isStageAfterCvScreening =
      dto.stage_type === 'HR_INTERVIEW' ||
      dto.stage_type === 'MANAGEMENT_INTERVIEW';

    if (isTryingToLolos && isStageAfterCvScreening) {
      const latestInterview = await this.prisma.interview.findFirst({
        where: { application_id: applicationId },
        orderBy: { schedule: 'desc' },
      });

      if (!latestInterview) {
        throw new BadRequestException(
          'Tidak dapat meloloskan kandidat yang belum memiliki jadwal interview.',
        );
      }

      if (application.status !== 'CONFIRMED_INTERVIEW') {
        throw new BadRequestException(
          'Kandidat belum mengonfirmasi kehadiran interview, tidak bisa diloloskan.',
        );
      }
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

    if (finalStatus) {
      await this.prisma.application.update({
        where: { id: applicationId },
        data: {
          status: finalStatus,
          updated_at: new Date(),
        },
      });
    }

    const student = await this.prisma.student.findUnique({
      where: { id: application.student_id },
      include: { user: true },
    });

    await this.mailerService.sendMailWithTemplate(
      student.user.email,
      'Tahapan Rekrutmen Anda Telah Diperbarui',
      'stage-update',
      {
        username: student.user.username,
        stageType: dto.stage_type,
        notes: dto.notes ?? '-',
      },
    );

    return stage;
  }

  async updateStage(
    stageId: string,
    dto: RecruitmentStageUpdateDto,
    changedByUserId?: string,
    interviewDto?: InterviewCreateDto,
  ) {
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

    const application = existing.application;

    const wasInterview =
      existing.stage_type === 'HR_INTERVIEW' ||
      existing.stage_type === 'MANAGEMENT_INTERVIEW';

    const nowInterview =
      dto.stage_type === 'HR_INTERVIEW' ||
      dto.stage_type === 'MANAGEMENT_INTERVIEW';

    const finalStatuses: ApplicationStatus[] = ['ACCEPTED', 'REJECTED'];

    if (
      dto.final_status === 'ACCEPTED' ||
      dto.final_status === 'CONFIRMED_INTERVIEW'
    ) {
      const latestInterview = await this.prisma.interview.findFirst({
        where: { application_id: application.id },
        orderBy: { schedule: 'desc' },
      });

      if (!latestInterview) {
        throw new BadRequestException(
          'Tidak dapat meloloskan kandidat yang belum memiliki jadwal interview.',
        );
      }

      const status = application.status;
      if (status !== 'CONFIRMED_INTERVIEW') {
        throw new BadRequestException(
          'Kandidat belum mengonfirmasi kehadiran interview, tidak bisa diloloskan.',
        );
      }
    }

    const requiresRepeatInterview =
      (existing.stage_type === 'MANAGEMENT_INTERVIEW' &&
        dto.stage_type === 'HR_INTERVIEW') ||
      (existing.stage_type === 'HR_INTERVIEW' &&
        dto.stage_type === 'CV_SCREENING');

    if (requiresRepeatInterview && interviewDto) {
      await this.prisma.interview.deleteMany({
        where: { application_id: existing.application_id },
      });

      await this.prisma.interview.create({
        data: {
          application_id: existing.application_id,
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

    if (
      wasInterview &&
      nowInterview &&
      existing.stage_type !== dto.stage_type &&
      !interviewDto
    ) {
      await this.prisma.interview.updateMany({
        where: { application_id: existing.application_id },
        data: {
          type: dto.stage_type === 'HR_INTERVIEW' ? 'HR' : 'MANAGEMENT',
        },
      });
    }

    if (wasInterview && !nowInterview && !interviewDto) {
      await this.prisma.interview.deleteMany({
        where: { application_id: existing.application_id },
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
      if (!application) {
        throw new NotFoundException('Lamaran tidak ditemukan');
      }

      if (
        finalStatuses.includes(application.status) &&
        dto.final_status !== application.status
      ) {
        throw new BadRequestException(
          'Status final tidak dapat diubah kecuali oleh admin.',
        );
      }

      if (application.status !== dto.final_status) {
        await this.prisma.applicationHistory.create({
          data: {
            application_id: application.id,
            changed_by: changedByUserId ?? 'SYSTEM',
            from_status: application.status,
            to_status: dto.final_status,
            reason: dto.notes ?? 'Perubahan status melalui updateStage',
          },
        });
      }

      await this.prisma.application.update({
        where: { id: application.id },
        data: {
          status: dto.final_status,
          updated_at: new Date(),
        },
      });
    }

    const student = await this.prisma.student.findUnique({
      where: { id: application.student_id },
      include: { user: true },
    });

    await this.mailerService.sendMailWithTemplate(
      student.user.email,
      'Perubahan Tahapan Rekrutmen',
      'stage-update',
      {
        username: student.user.username,
        stageType: dto.stage_type,
        notes: dto.notes ?? '-',
      },
    );

    return updatedStage;
  }
}
