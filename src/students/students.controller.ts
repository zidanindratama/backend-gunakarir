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
import { StudentsService } from './students.service';
import { StudentProfileUpdateDto } from './dtos/student-profile-update.dto';
import { StudentFilterDto } from './dtos/student-filter.dto';
import { BypassApproval } from '../common/decorators/bypass-approval.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { EducationDto } from './dtos/education.dto';
import { WorkExperienceDto } from './dtos/work-experience.dto';
import { OrganizationalExperienceDto } from './dtos/organizational-experience';

@Controller('api/students')
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  @Public()
  @Get()
  async getAllStudents(@Query() query: StudentFilterDto) {
    return this.studentsService.getAllStudents(query);
  }

  @Public()
  @Get('/:studentId')
  async getStudentDetail(@Param('studentId') studentId: string) {
    return this.studentsService.getStudentDetail(studentId);
  }

  @Roles('STUDENT')
  @BypassApproval()
  @Post('update-otp-request')
  async requestUpdateOtp(@Req() req: Request) {
    const user = req.user;
    return this.studentsService.sendStudentUpdateOtp(user.id);
  }

  @Patch('update-my-profile')
  async updateMyProfile(
    @Req() req: Request,
    @Body()
    body: {
      data: Partial<StudentProfileUpdateDto> & {
        username?: string;
        image_url?: string;
        educations?: EducationDto[];
        workExperiences?: WorkExperienceDto[];
        organizationalExperiences?: OrganizationalExperienceDto[];
      };
      otp: string;
    },
  ) {
    const user = req.user;
    return this.studentsService.updateMyProfile(user.id, body.data, body.otp);
  }

  @Roles('ADMIN')
  @Delete('/:studentId')
  async deleteStudent(@Param('studentId') studentId: string) {
    return this.studentsService.deleteStudent(studentId);
  }
}
