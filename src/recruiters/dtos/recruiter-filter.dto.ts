import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const RecruiterFilterSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.enum(['APPROVED', 'REJECTED', 'PENDING']).optional(),
  search: z.string().optional(),
});

export class RecruiterFilterDto extends createZodDto(RecruiterFilterSchema) {}
