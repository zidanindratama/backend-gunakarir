import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { RecruitersService } from './recruiters.service';
import { AdminReviewDto } from './dtos/admin-review.dto';
import { RecruiterRequestDto } from './dtos/recruiter-request.dto';
import { RecruiterFilterDto } from './dtos/recruiter-filter.dto';
import { BypassApproval } from '../common/decorators/bypass-approval.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('api/recruiters')
export class RecruitersController {
  constructor(private recruitersService: RecruitersService) {}

  @Public()
  @Get()
  async getAllRecruiters(@Query() query: RecruiterFilterDto) {
    return this.recruitersService.getAllRecruiters(query);
  }

  @Public()
  @Get('/:recruiterId')
  async getRecruiterDetail(@Param('recruiterId') recruiterId: string) {
    return this.recruitersService.getRecruiterDetail(recruiterId);
  }

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

  @Roles('RECRUITER')
  @BypassApproval()
  @Post('update-otp-request')
  async requestUpdateOtp(@Req() req: Request) {
    const user = req.user;
    return this.recruitersService.sendRecruiterUpdateOtp(user.id);
  }

  @Roles('ADMIN')
  @Patch('review/:recruiterId')
  async reviewRequest(
    @Param('recruiterId') recruiterId: string,
    @Body() dto: AdminReviewDto,
  ) {
    return this.recruitersService.reviewRecruiterRequest(recruiterId, dto);
  }

  @Roles('RECRUITER')
  @BypassApproval()
  @Patch('update-pending')
  async updatePendingRecruiter(
    @Req() req: Request,
    @Body() dto: Partial<RecruiterRequestDto>,
  ) {
    const user = req.user;
    return this.recruitersService.updateRecruiterWhilePending(user.id, dto);
  }

  @Roles('RECRUITER')
  @Patch('update-approved')
  async updateApprovedRecruiter(
    @Req() req: Request,
    @Body() body: { data: Partial<RecruiterRequestDto>; otp: string },
  ) {
    const user = req.user;
    return this.recruitersService.updateRecruiterWithOtp(
      user.id,
      body.otp,
      body.data,
    );
  }

  @Roles('ADMIN')
  @Delete('/:recruiterId')
  async deleteRecruiter(@Param('recruiterId') recruiterId: string) {
    return this.recruitersService.deleteRecruiter(recruiterId);
  }
}
