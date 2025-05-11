import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const ApplicationCreateSchema = z.object({
  job_id: z.string().min(1, 'Job ID wajib diisi'),
});

export class ApplicationCreateDto extends createZodDto(
  ApplicationCreateSchema,
) {}
