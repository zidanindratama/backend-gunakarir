import { Test, TestingModule } from '@nestjs/testing';
import { ProfileSettingService } from './profile-setting.service';

describe('ProfileSettingService', () => {
  let service: ProfileSettingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfileSettingService],
    }).compile();

    service = module.get<ProfileSettingService>(ProfileSettingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
