import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { FacultiesService } from './faculties.service';
import { FacultyFilterDto } from './dtos/faculty-filter.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('api/faculties')
export class FacultiesController {
  constructor(private facultyService: FacultiesService) {}

  @Public()
  @Get()
  async getAll(@Query() query: FacultyFilterDto) {
    return this.facultyService.getAll(query);
  }

  @Public()
  @Get('/:id')
  async getById(@Param('id') id: string) {
    return this.facultyService.getById(id);
  }

  @Roles('ADMIN')
  @Post()
  async create(@Body() data: { name: string }) {
    return this.facultyService.create(data);
  }

  @Roles('ADMIN')
  @Patch('/:id')
  async update(@Param('id') id: string, @Body() data: { name: string }) {
    return this.facultyService.update(id, data);
  }

  @Roles('ADMIN')
  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return this.facultyService.delete(id);
  }
}
