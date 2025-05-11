import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApplicationStatus } from '@prisma/client';

export const ApplicationFilterSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  status: z.nativeEnum(ApplicationStatus).optional(),
  job_id: z.string().optional(),
  student_id: z.string().optional(),
});

export class ApplicationFilterDto extends createZodDto(
  ApplicationFilterSchema,
) {}
