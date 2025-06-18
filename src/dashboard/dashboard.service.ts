import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  startOfWeek,
  endOfWeek,
  subWeeks,
  startOfMonth,
  endOfMonth,
  parse,
} from 'date-fns';
import { JobType } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getRecruiterDashboard(userId: string) {
    const recruiter = await this.prisma.recruiter.findFirst({
      where: {
        user_id: userId,
      },
    });

    if (!recruiter) {
      throw new NotFoundException('Recruiter tidak ditemukan');
    }

    const recruiterId = recruiter.id;
    const now = new Date();

    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const lastWeekStart = subWeeks(thisWeekStart, 1);
    const lastWeekEnd = subWeeks(thisWeekEnd, 1);

    const totalApplications = await this.prisma.application.count({
      where: {
        job: { recruiter_id: recruiterId },
      },
    });

    const thisWeekApplications = await this.prisma.application.count({
      where: {
        applied_at: { gte: thisWeekStart, lte: thisWeekEnd },
        job: { recruiter_id: recruiterId },
      },
    });

    const lastWeekApplications = await this.prisma.application.count({
      where: {
        applied_at: { gte: lastWeekStart, lte: lastWeekEnd },
        job: { recruiter_id: recruiterId },
      },
    });

    const applicationsGrowth = this.calculateGrowth(
      thisWeekApplications,
      lastWeekApplications,
    );

    const activeJobs = await this.prisma.job.count({
      where: {
        recruiter_id: recruiterId,
        status: true,
      },
    });

    const endingSoonJobs = await this.prisma.job.count({
      where: {
        recruiter_id: recruiterId,
        status: true,
        application_end: {
          lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // dalam 3 hari ke depan
        },
      },
    });

    const passedCandidates = await this.prisma.application.count({
      where: {
        job: { recruiter_id: recruiterId },
        status: {
          in: ['INTERVIEW_INVITED', 'CONFIRMED_INTERVIEW', 'ACCEPTED'],
        },
      },
    });

    const thisWeekInterviews = await this.prisma.interview.count({
      where: {
        schedule: { gte: thisWeekStart, lte: thisWeekEnd },
        application: {
          job: { recruiter_id: recruiterId },
        },
      },
    });

    const lastWeekInterviews = await this.prisma.interview.count({
      where: {
        schedule: { gte: lastWeekStart, lte: lastWeekEnd },
        application: {
          job: { recruiter_id: recruiterId },
        },
      },
    });

    const interviewGrowth = this.calculateGrowth(
      thisWeekInterviews,
      lastWeekInterviews,
    );

    return {
      totalApplications,
      thisWeekApplications,
      applicationsGrowth,
      activeJobs,
      endingSoonJobs,
      passedCandidates,
      thisWeekInterviews,
      interviewGrowth,
    };
  }

  async getAdminDashboard() {
    const totalJobs = await this.prisma.job.count();
    const totalRecruiters = await this.prisma.recruiter.count({
      where: { status: 'APPROVED' },
    });
    const totalStudents = await this.prisma.student.count();
    const totalApplications = await this.prisma.application.count();

    return {
      totalJobs,
      totalRecruiters,
      totalStudents,
      totalApplications,
    };
  }

  async getJobTypePieStats(userId: string, month?: string) {
    const recruiter = await this.prisma.recruiter.findFirst({
      where: { user_id: userId },
    });

    if (!recruiter) {
      throw new NotFoundException('Recruiter tidak ditemukan');
    }

    const recruiterId = recruiter.id;

    const jobTypes = Object.values(JobType); // Ambil semua enum dari JobType

    // Default: gunakan bulan sekarang jika month tidak dikirim
    const now = new Date();
    const [monthStr, yearStr] = month?.split('/') ?? [
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getFullYear()),
    ];

    const parsedMonth = parse(`${monthStr}/${yearStr}`, 'MM/yyyy', new Date());
    const start = startOfMonth(parsedMonth);
    const end = endOfMonth(parsedMonth);

    const jobTypeCounts = await Promise.all(
      jobTypes.map(async (type) => {
        const count = await this.prisma.job.count({
          where: {
            recruiter_id: recruiterId,
            type: type,
            created_at: {
              gte: start,
              lte: end,
            },
          },
        });

        return { type, count };
      }),
    );

    return jobTypeCounts;
  }

  async getJobTypeLineStats(userId: string) {
    const recruiter = await this.prisma.recruiter.findFirst({
      where: { user_id: userId },
    });

    if (!recruiter) {
      throw new NotFoundException('Recruiter tidak ditemukan');
    }

    const jobTypes = Object.values(JobType);
    const recruiterId = recruiter.id;

    const jobTypeCounts = await Promise.all(
      jobTypes.map(async (type) => {
        const count = await this.prisma.job.count({
          where: {
            recruiter_id: recruiterId,
            type,
          },
        });

        return {
          type,
          count,
        };
      }),
    );

    return jobTypeCounts;
  }

  async getJobTypeBarStats() {
    const jobTypes = Object.values(JobType);

    const jobTypeCounts = await Promise.all(
      jobTypes.map(async (type) => {
        const count = await this.prisma.job.count({
          where: {
            type,
          },
        });

        return { type, count };
      }),
    );

    return jobTypeCounts;
  }

  private calculateGrowth(thisWeek: number, lastWeek: number): number {
    if (lastWeek === 0 && thisWeek > 0) return 100;
    if (lastWeek === 0 && thisWeek === 0) return 0;
    return Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
  }
}
