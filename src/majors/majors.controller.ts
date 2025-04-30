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
import { MajorsService } from './majors.service';
import { MajorFilterDto } from './dtos/major-filter.dto';
import { MajorCreateDto } from './dtos/major-create.dto';
import { MajorUpdateDto } from './dtos/major-update.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('api/majors')
export class MajorsController {
  constructor(private majorsService: MajorsService) {}

  @Public()
  @Get()
  async getAll(@Query() query: MajorFilterDto) {
    return this.majorsService.getAll(query);
  }

  @Public()
  @Get('/:id')
  async getById(@Param('id') id: string) {
    return this.majorsService.getById(id);
  }

  @Roles('ADMIN')
  @Post()
  async create(@Body() data: MajorCreateDto) {
    return this.majorsService.create(data);
  }

  @Roles('ADMIN')
  @Patch('/:id')
  async update(@Param('id') id: string, @Body() data: MajorUpdateDto) {
    return this.majorsService.update(id, data);
  }

  @Roles('ADMIN')
  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return this.majorsService.delete(id);
  }
}
