import { Controller, Post, Param, Body, UseGuards } from '@nestjs/common';
import { RecruitmentStagesService } from './recruitment-stages.service';
import { RecruitmentStageCreateDto } from './dtos/recruitment-stage-create.dto';
import { InterviewCreateDto } from './dtos/interview-create.dto';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('api/applications/:id/stages')
export class RecruitmentStagesController {
  constructor(private readonly stageService: RecruitmentStagesService) {}

  @Roles('RECRUITER')
  @Post()
  async addStage(
    @Param('id') applicationId: string,
    @Body()
    body: { stage: RecruitmentStageCreateDto; interview?: InterviewCreateDto },
  ) {
    return this.stageService.addStage(
      applicationId,
      body.stage,
      body.interview,
    );
  }
}
