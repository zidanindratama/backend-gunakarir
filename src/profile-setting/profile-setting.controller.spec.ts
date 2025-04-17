import { Test, TestingModule } from '@nestjs/testing';
import { ProfileSettingController } from './profile-setting.controller';

describe('ProfileSettingController', () => {
  let controller: ProfileSettingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileSettingController],
    }).compile();

    controller = module.get<ProfileSettingController>(ProfileSettingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
