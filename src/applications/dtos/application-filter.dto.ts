import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApplicationStatus, StageType } from '@prisma/client';

export const ApplicationFilterSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  job_id: z.string().optional(),
  student_id: z.string().optional(),
  status: z.nativeEnum(ApplicationStatus).optional(),
  stage_type: z.nativeEnum(StageType).optional(),
  exclude_status: z.nativeEnum(ApplicationStatus).optional(),
});

export class ApplicationFilterDto extends createZodDto(
  ApplicationFilterSchema,
) {}
