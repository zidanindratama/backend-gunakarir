import { Body, Controller, Param, Patch, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { RecruiterRequestDto } from './dtos/recruiter-request.dto';
import { RecruitersService } from './recruiters.service';
import { BypassApproval } from '../common/decorators/bypass-approval.decorator';
import { AdminReviewDto } from './dtos/admin-review.dto';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('api/recruiters')
export class RecruitersController {
  constructor(private recruitersService: RecruitersService) {}

  @Roles('RECRUITER')
  @BypassApproval()
  @Post('request')
  async createRequest(@Req() req: Request, @Body() dto: RecruiterRequestDto) {
    const user = req.user;
    return this.recruitersService.recruiterRequestCreate(user.id, dto);
  }

  @Roles('RECRUITER')
  @BypassApproval()
  @Patch('appeal')
  async appealRequest(
    @Req() req: Request,
    @Body() dto: Partial<RecruiterRequestDto>,
  ) {
    const user = req.user;
    return this.recruitersService.recruiterRequestAppeal(user.id, dto);
  }

  @Roles('ADMIN')
  @Patch('review/:recruiterId')
  async reviewRequest(
    @Param('recruiterId') recruiterId: string,
    @Body() dto: AdminReviewDto,
  ) {
    return this.recruitersService.reviewRecruiterRequest(recruiterId, dto);
  }
}
