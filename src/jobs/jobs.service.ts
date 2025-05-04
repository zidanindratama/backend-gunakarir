import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JobFilterDto } from './dtos/job-filter.dto';
import { CreateJobDto } from './dtos/job-create.dto';
import { UpdateJobDto } from './dtos/job-update.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async getAllJobs(query: JobFilterDto) {
    const page = +(query.page ?? 1);
    const limit = +(query.limit ?? 10);
    const skip = (page - 1) * limit;

    const where: Prisma.JobWhereInput = {
      ...(query.search && {
        title: { contains: query.search, mode: 'insensitive' },
      }),
      ...(query.province_id && { province_id: query.province_id }),
      ...(query.city_id && { city_id: query.city_id }),
      ...(query.status && { status: query.status }),
      ...(query.recruiter_id && { recruiter_id: query.recruiter_id }),
      ...(query.majorId && {
        jobMajors: {
          some: {
            major_id: query.majorId,
          },
        },
      }),
    };

    const jobs = await this.prisma.job.findMany({
      skip,
      take: limit,
      where: {
        ...where,
      },
      orderBy: {
        created_at: 'desc',
      },
      include: {
        recruiter: {
          select: {
            id: true,
            company_name: true,
            company_logo: true,
            status: true,
          },
        },
        jobMajors: {
          include: {
            major: {
              select: {
                id: true,
                name: true,
                degree: true,
              },
            },
          },
        },
      },
    });

    const jobCount = await this.prisma.job.count({ where });

    return {
      jobs,
      meta: {
        page,
        limit,
        total: jobCount,
        totalPages: Math.ceil(jobCount / limit),
      },
    };
  }

  async getJobById(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        recruiter: {
          select: {
            id: true,
            company_name: true,
            company_logo: true,
            status: true,
          },
        },
        jobMajors: {
          include: {
            major: {
              select: {
                id: true,
                name: true,
                degree: true,
              },
            },
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Lowongan pekerjaan tidak ditemukan.');
    }

    return job;
  }

  async createJob(dto: CreateJobDto, recruiterId: string) {
    const job = await this.prisma.job.create({
      data: {
        title: dto.title,
        short_description: dto.short_description,
        full_description: dto.full_description,
        salary: dto.salary,
        quota: dto.quota,
        application_start: dto.application_start,
        application_end: dto.application_end,
        province_id: dto.province_id,
        city_id: dto.city_id,
        recruiter_id: recruiterId,
        jobMajors: dto.major_ids
          ? {
              create: dto.major_ids.map((id) => ({ major_id: id })),
            }
          : undefined,
      },
    });

    return job;
  }

  async updateJob(id: string, dto: UpdateJobDto) {
    const job = await this.prisma.job.findUnique({ where: { id } });
    if (!job) {
      throw new NotFoundException('Lowongan pekerjaan tidak ditemukan.');
    }

    const { major_ids, ...jobData } = dto;

    const updatedJob = await this.prisma.job.update({
      where: { id },
      data: {
        ...jobData,
        jobMajors: major_ids
          ? {
              deleteMany: {},
              create: major_ids.map((id) => ({ major_id: id })),
            }
          : undefined,
      },
    });

    return updatedJob;
  }

  async deleteJob(id: string) {
    const job = await this.prisma.job.findUnique({ where: { id } });
    if (!job) {
      throw new NotFoundException('Lowongan pekerjaan tidak ditemukan.');
    }

    await this.prisma.job.delete({ where: { id } });

    return { message: 'Lowongan pekerjaan berhasil dihapus.' };
  }
}
