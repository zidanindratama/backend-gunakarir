import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsService } from './applications.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ApplicationCreateDto } from './dtos/application-create.dto';
import { ApplicationUpdateDto } from './dtos/application-update.dto';
import { ApplicationFilterDto } from './dtos/application-filter.dto';
import { mockPrismaService } from '../__mocks__/prisma.service';

describe('ApplicationsService', () => {
  let service: ApplicationsService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
    prisma = module.get(PrismaService) as typeof mockPrismaService;

    jest.clearAllMocks(); // ⬅️ Reset state setiap test
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllApplication', () => {
    it('should return paginated applications', async () => {
      const query: ApplicationFilterDto = {
        page: '1',
        limit: '2',
      };

      prisma.application.findMany.mockResolvedValue([]);
      prisma.application.count.mockResolvedValue(0);

      const result = await service.getAllApplication(query);
      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(2);
    });
  });

  describe('getApplicationById', () => {
    it('should return the application', async () => {
      prisma.application.findUnique.mockResolvedValue({ id: 'app1' });
      const result = await service.getApplicationById('app1');
      expect(result.id).toBe('app1');
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.application.findUnique.mockResolvedValue(null);
      await expect(service.getApplicationById('404')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createApplication', () => {
    it('should throw if already applied', async () => {
      prisma.application.findFirst.mockResolvedValue({ id: 'exists' });
      await expect(
        service.createApplication('student-id', { job_id: 'job-id' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create application', async () => {
      prisma.application.findFirst.mockResolvedValue(null);
      prisma.application.create.mockResolvedValue({ id: 'new-app' });

      const dto: ApplicationCreateDto = { job_id: 'job-id' };
      const result = await service.createApplication('student-id', dto);
      expect(result.id).toBe('new-app');
    });
  });

  describe('updateApplicationStatus', () => {
    it('should update if application exists', async () => {
      prisma.application.findUnique.mockResolvedValue({ id: 'app1' });
      prisma.application.update.mockResolvedValue({
        id: 'app1',
        status: 'ACCEPTED',
      });

      const dto: ApplicationUpdateDto = { status: 'ACCEPTED' };
      const result = await service.updateApplicationStatus('app1', dto);
      expect(result.status).toBe('ACCEPTED');
    });

    it('should throw if not found', async () => {
      prisma.application.findUnique.mockResolvedValue(null);
      await expect(
        service.updateApplicationStatus('notfound', {
          status: 'REJECTED',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteApplication', () => {
    it('should delete if found', async () => {
      prisma.application.findUnique.mockResolvedValue({ id: 'app1' });
      prisma.application.delete.mockResolvedValue({});
      const result = await service.deleteApplication('app1');
      expect(result.message).toBe('Lamaran berhasil dihapus.');
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.application.findUnique.mockResolvedValue(null);
      await expect(service.deleteApplication('notfound')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
