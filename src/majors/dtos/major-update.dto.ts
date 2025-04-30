import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const MajorUpdateSchema = z.object({
  name: z.string().min(3).optional(),
  study_program_id: z.string().min(10).optional(),
  degree: z.enum(['D3', 'S1', 'S2', 'S3']).optional(),
});

export class MajorUpdateDto extends createZodDto(MajorUpdateSchema) {}
