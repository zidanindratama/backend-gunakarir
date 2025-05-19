import { Controller, Post, Param, Body, Get } from '@nestjs/common';
import { AiInterviewService } from './ai-interview.service';
import { SubmitAnswersDto, SubmitAnswersType } from './dtos/submit-answers.dto';
import { TestPromptDto } from './dtos/test-prompt.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('api/ai-interviews')
export class AiInterviewController {
  constructor(private aiInterviewService: AiInterviewService) {}

  @Get('detail/:applicationId')
  async getInterviewDetail(@Param('applicationId') applicationId: string) {
    return this.aiInterviewService.getInterviewDetail(applicationId);
  }

  @Get('questions/:interviewId')
  getQuestionsToAnswer(@Param('interviewId') interviewId: string) {
    return this.aiInterviewService.getQuestionsToAnswer(interviewId);
  }

  @Public()
  @Post('ask')
  async testAsk(@Body() dto: TestPromptDto) {
    const response = await this.aiInterviewService.testAskQuestion(
      dto.question,
    );
    return { question: dto.question, response };
  }

  @Post('generate/:applicationId')
  generate(@Param('applicationId') applicationId: string) {
    return this.aiInterviewService.generateInterview(applicationId);
  }

  @Post('submit-answers/:interviewId')
  submitAnswers(
    @Param('interviewId') interviewId: string,
    @Body() dto: SubmitAnswersDto,
  ) {
    const typedAnswers: SubmitAnswersType['answers'] = dto.answers;
    return this.aiInterviewService.submitAnswers(interviewId, typedAnswers);
  }
}
