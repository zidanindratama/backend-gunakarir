import { Test, TestingModule } from '@nestjs/testing';
import { StudyProgramsService } from './study-programs.service';

describe('StudyProgramsService', () => {
  let service: StudyProgramsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StudyProgramsService],
    }).compile();

    service = module.get<StudyProgramsService>(StudyProgramsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
