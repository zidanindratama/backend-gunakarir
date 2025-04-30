import { Test, TestingModule } from '@nestjs/testing';
import { StudyProgramsController } from './study-programs.controller';

describe('StudyProgramsController', () => {
  let controller: StudyProgramsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudyProgramsController],
    }).compile();

    controller = module.get<StudyProgramsController>(StudyProgramsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
