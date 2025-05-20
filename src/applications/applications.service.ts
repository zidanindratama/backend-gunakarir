import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicationFilterDto } from './dtos/application-filter.dto';
import { ApplicationCreateDto } from './dtos/application-create.dto';
import { ApplicationUpdateDto } from './dtos/application-update.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async getAllApplication(query: ApplicationFilterDto) {
    const page = +(query.page ?? 1);
    const limit = +(query.limit ?? 10);
    const skip = (page - 1) * limit;

    const where: Prisma.ApplicationWhereInput = {
      ...(query.status && { status: query.status }),
      ...(query.exclude_status && {
        NOT: { status: query.exclude_status },
      }),
      ...(query.student_id && { student_id: query.student_id }),
      ...(query.job_id && { job_id: query.job_id }),
      ...(query.search && {
        job: {
          is: {
            title: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
        },
      }),
      ...(query.stage_type && {
        stages: {
          some: {
            stage_type: query.stage_type,
          },
        },
      }),
    };

    const applications = await this.prisma.application.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        applied_at: 'desc',
      },
      include: {
        student: true,
        job: {
          include: {
            recruiter: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        stages: {
          orderBy: {
            created_at: 'asc',
          },
        },
        interviews: {
          orderBy: {
            schedule: 'asc',
          },
        },
        AiInterview: {
          include: {
            questions: {
              include: {
                feedback: true,
              },
              orderBy: {
                created_at: 'asc',
              },
            },
          },
        },
      },
    });

    const total = await this.prisma.application.count({ where });

    return {
      data: applications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getApplicationsByJobId(jobId: string, query: ApplicationFilterDto) {
    const page = +(query.page ?? 1);
    const limit = +(query.limit ?? 10);
    const skip = (page - 1) * limit;

    const where: Prisma.ApplicationWhereInput = {
      job_id: jobId,
      ...(query.status && { status: query.status }),
      ...(query.exclude_status && {
        NOT: { status: query.exclude_status },
      }),
      ...(query.student_id && { student_id: query.student_id }),
      ...(query.search && {
        job: {
          is: {
            title: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
        },
      }),
      ...(query.stage_type && {
        stages: {
          some: {
            stage_type: query.stage_type,
          },
        },
      }),
    };

    const applications = await this.prisma.application.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        applied_at: 'desc',
      },
      include: {
        student: true,
        job: {
          include: {
            recruiter: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        stages: {
          orderBy: {
            created_at: 'asc',
          },
        },
        interviews: {
          orderBy: {
            schedule: 'asc',
          },
        },
      },
    });

    const total = await this.prisma.application.count({ where });

    return {
      data: applications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getApplicationById(id: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        student: true,
        job: {
          include: {
            recruiter: true,
          },
        },
        stages: {
          orderBy: {
            created_at: 'asc',
          },
        },
        interviews: {
          orderBy: {
            schedule: 'asc',
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Lamaran tidak ditemukan.');
    }

    return application;
  }

  async createApplication(studentId: string, dto: ApplicationCreateDto) {
    const existing = await this.prisma.application.findFirst({
      where: {
        student_id: studentId,
        job_id: dto.job_id,
      },
    });

    if (existing) {
      throw new BadRequestException('Kamu sudah melamar pekerjaan ini.');
    }

    return this.prisma.application.create({
      data: {
        student_id: studentId,
        job_id: dto.job_id,
        stages: {
          create: {
            stage_type: 'CV_SCREENING',
          },
        },
      },
    });
  }

  async updateApplicationStatus(id: string, dto: ApplicationUpdateDto) {
    const application = await this.prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException('Lamaran tidak ditemukan.');
    }

    return this.prisma.application.update({
      where: { id },
      data: dto,
    });
  }

  async deleteApplication(id: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException('Lamaran tidak ditemukan.');
    }

    await this.prisma.application.delete({ where: { id } });

    return { message: 'Lamaran berhasil dihapus.' };
  }
}
