import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { Roles } from '../common/decorators/roles.decorator';
import { ApplicationFilterDto } from './dtos/application-filter.dto';
import { ApplicationCreateDto } from './dtos/application-create.dto';
import { ApplicationUpdateDto } from './dtos/application-update.dto';

@Controller('api/applications')
export class ApplicationsController {
  constructor(private appService: ApplicationsService) {}

  @Roles('ADMIN', 'RECRUITER')
  @Get()
  async getAllApplication(@Query() query: ApplicationFilterDto) {
    return this.appService.getAllApplication(query);
  }

  @Get('/stages/:jobId')
  async getApplicationsByJob(
    @Param('jobId') jobId: string,
    @Query() query: ApplicationFilterDto,
  ) {
    return this.appService.getApplicationsByJobId(jobId, query);
  }

  @Get('/my-applications/:studentId')
  async getMyApplications(
    @Param('studentId') studentId: string,
    @Query() query: ApplicationFilterDto,
  ) {
    return this.appService.getAllApplication({
      ...query,
      student_id: studentId,
    });
  }

  @Get('/:id')
  async getApplicationById(@Param('id') id: string) {
    return this.appService.getApplicationById(id);
  }

  @Roles('STUDENT')
  @Post('/:studentId')
  async createApplication(
    @Param('studentId') studentId: string,
    @Body() dto: ApplicationCreateDto,
  ) {
    return this.appService.createApplication(studentId, dto);
  }

  @Patch('/:id')
  async updateApplicationStatus(
    @Param('id') id: string,
    @Body() dto: ApplicationUpdateDto,
  ) {
    return this.appService.updateApplicationStatus(id, dto);
  }

  @Delete('/:id')
  async deleteApplication(@Param('id') id: string) {
    return this.appService.deleteApplication(id);
  }
}
