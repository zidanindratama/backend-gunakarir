import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const JobFilterSchema = z.object({
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).optional(),
  search: z.string().optional(),
  province_id: z.string().optional(),
  city_id: z.string().optional(),
  majorId: z.string().optional(),
  recruiter_id: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'CLOSED']).optional(),
});

export class JobFilterDto extends createZodDto(JobFilterSchema) {}
