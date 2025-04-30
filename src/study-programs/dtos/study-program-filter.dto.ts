import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const StudyProgramFilterSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'created_at']).optional(),
});

export class StudyProgramFilterDto extends createZodDto(
  StudyProgramFilterSchema,
) {}
