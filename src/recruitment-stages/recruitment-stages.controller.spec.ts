import { Test, TestingModule } from '@nestjs/testing';
import { RecruitmentStagesController } from './recruitment-stages.controller';

describe('RecruitmentStagesController', () => {
  let controller: RecruitmentStagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecruitmentStagesController],
    }).compile();

    controller = module.get<RecruitmentStagesController>(RecruitmentStagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
