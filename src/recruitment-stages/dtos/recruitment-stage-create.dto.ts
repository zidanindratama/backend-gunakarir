import { z } from 'zod';
import { StageType } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';

export const RecruitmentStageCreateSchema = z.object({
  stage_type: z.nativeEnum(StageType),
  notes: z.string().optional(),
});

export class RecruitmentStageCreateDto extends createZodDto(
  RecruitmentStageCreateSchema,
) {}
