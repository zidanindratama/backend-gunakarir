import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const StudentFilterSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
});

export class StudentFilterDto extends createZodDto(StudentFilterSchema) {}
