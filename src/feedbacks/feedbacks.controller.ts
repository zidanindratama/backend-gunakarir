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
import { Request } from 'express';
import { FeedbacksService } from './feedbacks.service';
import { CreateFeedbackDto } from './dtos/create-feedback.dto';
import { UpdateFeedbackDto } from './dtos/update-feedback.dto';
import { FeedbackFilterDto } from './dtos/feedback-filter.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('api/feedbacks')
export class FeedbacksController {
  constructor(private feedbacksService: FeedbacksService) {}

  @Public()
  @Get()
  findAll(@Query() query: FeedbackFilterDto) {
    return this.feedbacksService.findAll(query);
  }

  @Roles('STUDENT', 'RECRUITER', 'ADMIN')
  @Get('/me')
  getMyFeedback(@Req() req: Request) {
    const user = req.user as any;
    return this.feedbacksService.findByUserId(user.id);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.feedbacksService.findOne(id);
  }

  @Roles('STUDENT', 'RECRUITER', 'ADMIN')
  @Post()
  create(@Req() req: Request, @Body() dto: CreateFeedbackDto) {
    const user = req.user as any;
    return this.feedbacksService.create(user.id, dto);
  }

  @Patch(':id')
  @Roles('STUDENT', 'RECRUITER', 'ADMIN')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFeedbackDto,
    @Req() req: Request,
  ) {
    const user = req.user;
    return this.feedbacksService.update(id, dto, {
      id: user.id,
      role: user.role,
    });
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.feedbacksService.remove(id);
  }
}
