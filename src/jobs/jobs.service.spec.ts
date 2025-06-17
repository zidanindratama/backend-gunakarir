import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { JobType } from '@prisma/client';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dtos/job-create.dto';
import { UpdateJobDto } from './dtos/job-update.dto';
import { JobFilterDto } from './dtos/job-filter.dto';
import { PrismaService } from '../prisma/prisma.service';
import { mockPrismaService } from '../__mocks__/prisma.service';

describe('JobsService', () => {
  let service: JobsService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
    prisma = module.get(PrismaService) as typeof mockPrismaService;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllJobs', () => {
    it('should return paginated job list', async () => {
      const query: JobFilterDto = {
        page: 1,
        limit: 2,
        search: 'dev',
      };

      const jobs = [
        { id: '1', title: 'Dev' },
        { id: '2', title: 'DevOps' },
      ];
      prisma.job.findMany.mockResolvedValue(jobs);
      prisma.job.count.mockResolvedValue(2);

      const result = await service.getAllJobs(query);
      expect(result.jobs).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });
  });

  describe('getJobById', () => {
    it('should return job with total_applicants', async () => {
      const job = {
        id: '1',
        title: 'Dev',
        _count: { applications: 3 },
        recruiter: {},
        jobMajors: [],
      };
      prisma.job.findUnique.mockResolvedValue(job);

      const result = await service.getJobById('1');
      expect(result.total_applicants).toBe(3);
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.job.findUnique.mockResolvedValue(null);
      await expect(service.getJobById('404')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createJob', () => {
    it('should create a new job', async () => {
      const dto: CreateJobDto = {
        title: 'Dev',
        short_description: 'Short',
        full_description: 'Full',
        salary: 5000,
        quota: 2,
        application_start: new Date(),
        application_end: new Date(),
        province_id: 'P1',
        city_id: 'C1',
        type: JobType.FULL_TIME,
        major_ids: ['mj1', 'mj2'],
        status: true,
      };

      const createdJob = { id: 'job1', ...dto };
      prisma.job.create.mockResolvedValue(createdJob);

      const result = await service.createJob(dto, 'recruiter1');
      expect(result).toEqual(createdJob);
    });
  });

  describe('updateJob', () => {
    it('should update job if exists', async () => {
      const dto: UpdateJobDto = {
        title: 'Updated Title',
        major_ids: ['mj1'],
        type: JobType.PART_TIME,
      };

      prisma.job.findUnique.mockResolvedValue({ id: 'job1' });
      prisma.job.update.mockResolvedValue({ id: 'job1', ...dto });

      const result = await service.updateJob('job1', dto);
      expect(result.title).toBe('Updated Title');
    });

    it('should throw NotFoundException if job not found', async () => {
      prisma.job.findUnique.mockResolvedValue(null);
      const dto: UpdateJobDto = {};
      await expect(service.updateJob('404', dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteJob', () => {
    it('should delete job if exists', async () => {
      prisma.job.findUnique.mockResolvedValue({ id: 'job1' });
      prisma.job.delete.mockResolvedValue({});
      const result = await service.deleteJob('job1');
      expect(result.message).toBe('Lowongan pekerjaan berhasil dihapus.');
    });

    it('should throw NotFoundException if job not found', async () => {
      prisma.job.findUnique.mockResolvedValue(null);
      await expect(service.deleteJob('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
