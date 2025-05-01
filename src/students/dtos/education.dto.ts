import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const EducationSchema = z
  .object({
    degree: z.enum(['D3', 'S1', 'S2', 'S3']),
    university: z.string().min(1, 'Universitas wajib diisi'),
    faculty: z.string().min(1, 'Fakultas wajib diisi'),
    major: z.string().min(1, 'Jurusan wajib diisi'),
    gpa: z.coerce.number().min(0, 'IPK minimal 0').max(4, 'IPK maksimal 4'),
    start_year: z.coerce
      .number()
      .min(1900, 'Tahun mulai minimal 1900')
      .max(2100, 'Tahun mulai maksimal 2100'),
    end_year: z.coerce
      .number()
      .min(1900, 'Tahun lulus minimal 1900')
      .max(2100, 'Tahun lulus maksimal 2100')
      .optional(),
    ongoing: z.boolean().optional(),
    description: z.string().optional(),
  })
  .refine((data) => !data.end_year || data.end_year >= data.start_year, {
    path: ['end_year'],
    message: 'Tahun lulus tidak boleh lebih awal dari tahun mulai',
  });

export class EducationDto extends createZodDto(EducationSchema) {}
