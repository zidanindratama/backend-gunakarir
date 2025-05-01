import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const FacultyFilterSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'created_at']).optional(),
});

export class FacultyFilterDto extends createZodDto(FacultyFilterSchema) {}
