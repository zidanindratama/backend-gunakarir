import { Test, TestingModule } from '@nestjs/testing';
import { AiInterviewService } from './ai-interview.service';

describe('AiInterviewService', () => {
  let service: AiInterviewService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiInterviewService],
    }).compile();

    service = module.get<AiInterviewService>(AiInterviewService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
