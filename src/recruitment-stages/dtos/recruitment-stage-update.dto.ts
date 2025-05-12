import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { StageType } from '@prisma/client';

export const RecruitmentStageUpdateSchema = z.object({
  stage_type: z.nativeEnum(StageType).optional(),
  final_status: z.enum(['ACCEPTED', 'REJECTED', 'PENDING']).optional(),
  notes: z.string().optional(),
});

export class RecruitmentStageUpdateDto extends createZodDto(
  RecruitmentStageUpdateSchema,
) {}
