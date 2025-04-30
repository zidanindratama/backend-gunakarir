import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const MajorCreateSchema = z.object({
  name: z.string().min(3, 'Nama jurusan minimal 3 karakter'),
  study_program_id: z.string(),
  degree: z.enum(['D3', 'S1', 'S2', 'S3'], {
    required_error: 'Jenjang pendidikan wajib dipilih',
  }),
});

export class MajorCreateDto extends createZodDto(MajorCreateSchema) {}
