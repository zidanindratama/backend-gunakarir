import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dtos/job-create.dto';
import { UpdateJobDto } from './dtos/job-update.dto';
import { JobFilterDto } from './dtos/job-filter.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('api/jobs')
export class JobsController {
  constructor(private jobsService: JobsService) {}

  @Public()
  @Get()
  getAllJobs(@Query() query: JobFilterDto) {
    return this.jobsService.getAllJobs(query);
  }

  @Public()
  @Get(':id')
  getJobById(@Param('id') id: string) {
    return this.jobsService.getJobById(id);
  }

  @Roles('RECRUITER')
  @Post(':recruiterId')
  createJob(
    @Param('recruiterId') recruiterId: string,
    @Body() dto: CreateJobDto,
  ) {
    return this.jobsService.createJob(dto, recruiterId);
  }

  @Roles('RECRUITER')
  @Patch(':id')
  updateJob(@Param('id') id: string, @Body() dto: UpdateJobDto) {
    return this.jobsService.updateJob(id, dto);
  }

  @Delete(':id')
  deleteJob(@Param('id') id: string) {
    return this.jobsService.deleteJob(id);
  }
}
