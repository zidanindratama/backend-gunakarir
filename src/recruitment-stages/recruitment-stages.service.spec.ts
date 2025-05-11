import { Test, TestingModule } from '@nestjs/testing';
import { RecruitmentStagesService } from './recruitment-stages.service';

describe('RecruitmentStagesService', () => {
  let service: RecruitmentStagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecruitmentStagesService],
    }).compile();

    service = module.get<RecruitmentStagesService>(RecruitmentStagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
