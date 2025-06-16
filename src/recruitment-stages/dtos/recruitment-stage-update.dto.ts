import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { StageType, ApplicationStatus, InterviewMethod } from '@prisma/client';

export const RecruitmentStageUpdateSchema = z.object({
  stage_type: z.nativeEnum(StageType).optional(),
  final_status: z.nativeEnum(ApplicationStatus).optional(),
  notes: z.string().optional(),

  repeat_interview: z.boolean().optional(),

  schedule: z.coerce.date().optional(),
  confirm_deadline: z.coerce.date().optional(),
  method: z.nativeEnum(InterviewMethod).optional(),
  link: z.string().optional(),
  location: z.string().optional(),
});

export class RecruitmentStageUpdateDto extends createZodDto(
  RecruitmentStageUpdateSchema,
) {}
