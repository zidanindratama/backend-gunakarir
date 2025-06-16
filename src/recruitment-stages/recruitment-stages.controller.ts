import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { RecruitmentStagesService } from './recruitment-stages.service';
import { RecruitmentStageCreateDto } from './dtos/recruitment-stage-create.dto';
import { InterviewCreateDto } from './dtos/interview-create.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RecruitmentStageUpdateDto } from './dtos/recruitment-stage-update.dto';
import { ApplicationStatus } from '@prisma/client';

@Controller('api/applications/:id/stages')
export class RecruitmentStagesController {
  constructor(private readonly stageService: RecruitmentStagesService) {}

  @Roles('RECRUITER')
  @Post()
  async addStage(
    @Param('id') applicationId: string,
    @Body()
    body: {
      stage: RecruitmentStageCreateDto;
      interview?: InterviewCreateDto;
      final_status?: ApplicationStatus;
    },
  ) {
    return this.stageService.addStage(
      applicationId,
      body.stage,
      body.interview,
      body.final_status,
    );
  }

  @Roles('RECRUITER')
  @Patch('/:stageId')
  async updateStage(
    @Param('stageId') stageId: string,
    @Body() dto: RecruitmentStageUpdateDto,
  ) {
    return this.stageService.updateStage(stageId, dto);
  }
}
