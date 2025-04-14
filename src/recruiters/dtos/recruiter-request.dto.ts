import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const RecruiterRequestSchema = z.object({
  company: z.string().min(3, 'Nama perusahaan minimal 3 karakter'),
  contract: z.string(),
  NPWP: z.string(),
  status: z.enum(['APPROVED', 'REJECTED', 'PENDING']).default('PENDING'),
  linkedin: z.string().optional(),
});

export class RecruiterRequestDto extends createZodDto(RecruiterRequestSchema) {}
