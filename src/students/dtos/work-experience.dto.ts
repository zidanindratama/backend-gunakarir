import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const WorkExperienceSchema = z
  .object({
    company_name: z.string().min(1, 'Nama perusahaan wajib diisi'),
    position: z.string().min(1, 'Posisi wajib diisi'),
    start_date: z.coerce.date({
      invalid_type_error: 'Tanggal mulai tidak valid',
    }),
    end_date: z.coerce
      .date({ invalid_type_error: 'Tanggal selesai tidak valid' })
      .optional(),
    description: z.string().optional(),
    ongoing: z.boolean().optional(),
  })
  .refine((data) => !data.end_date || data.end_date >= data.start_date, {
    path: ['end_date'],
    message: 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai',
  });

export class WorkExperienceDto extends createZodDto(WorkExperienceSchema) {}
