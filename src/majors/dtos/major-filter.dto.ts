import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const MajorFilterSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  degree: z.enum(['D3', 'S1', 'S2', 'S3']).optional(),
});

export class MajorFilterDto extends createZodDto(MajorFilterSchema) {}
