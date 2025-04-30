import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { StudyProgramsService } from './study-programs.service';
import { StudyProgramFilterDto } from './dtos/study-program-filter.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('api/study-programs')
export class StudyProgramsController {
  constructor(private studyProgramsService: StudyProgramsService) {}

  @Public()
  @Get()
  async getAll(@Query() query: StudyProgramFilterDto) {
    return this.studyProgramsService.getAll(query);
  }

  @Public()
  @Get('/:id')
  async getById(@Param('id') id: string) {
    return this.studyProgramsService.getById(id);
  }

  @Roles('ADMIN')
  @Post()
  async create(@Body() data: { name: string }) {
    return this.studyProgramsService.create(data);
  }

  @Roles('ADMIN')
  @Patch('/:id')
  async update(@Param('id') id: string, @Body() data: { name: string }) {
    return this.studyProgramsService.update(id, data);
  }

  @Roles('ADMIN')
  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return this.studyProgramsService.delete(id);
  }
}
